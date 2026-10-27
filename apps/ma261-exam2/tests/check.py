#!/usr/bin/env python
"""
MA 261 Exam 2 · independent math checker for tests/samples.json (written by tests/dump.js).

usage:  python -I tests/check.py [samples.json] [--only idPrefix] [--jobs 8] [--no-mutate] [-v]

Every chk spec is re-solved from its raw set-up with sympy (exact, with a time limit) and
with an independent numeric method (tanh-sinh quadrature in numpy, projected-gradient sweeps
for Lagrange problems).  Exact and numeric results are cross-checked against each other.
Also: every ans / distractor string is converted to sympy here and its value compared with the
page's own value (mEval) recorded by dump.js; a distractor whose value equals the true answer
is reported; and a mutation self-test replaces each key by a wrong one and expects a failure.
Exit code 1 on any failure.
"""
import sys, os, json, re, math, signal, random, argparse, traceback
from collections import defaultdict, OrderedDict
import numpy as np
import sympy as sp
from sympy.parsing.sympy_parser import (parse_expr, standard_transformations,
                                        implicit_multiplication, implicit_application, convert_xor, rationalize)

RTOL, ATOL = 1e-6, 1e-9
EXACT_TIMEOUT = 15

# ----------------------------------------------------------------- parsing (page input syntax → sympy)
x, y, z, t, r, u, v = sp.symbols('x y z t r u v', real=True)
rho, ph, th = sp.symbols('rho ph th', real=True)
SYM = {'x': x, 'y': y, 'z': z, 't': t, 'r': r, 'u': u, 'v': v, 'rho': rho, 'ph': ph, 'th': th}
LOCAL = dict(SYM)
LOCAL.update({'e': sp.E, 'pi': sp.pi, 'ln': sp.log, 'log': sp.log, 'exp': sp.exp, 'sqrt': sp.sqrt,
              'sin': sp.sin, 'cos': sp.cos, 'tan': sp.tan, 'sec': sp.sec, 'csc': sp.csc, 'cot': sp.cot,
              'arctan': sp.atan, 'arcsin': sp.asin, 'arccos': sp.acos, 'atan': sp.atan, 'asin': sp.asin,
              'acos': sp.acos, 'sinh': sp.sinh, 'cosh': sp.cosh, 'tanh': sp.tanh, 'abs': sp.Abs,
              'cbrt': sp.cbrt, 'theta': th, 'phi': ph})
WORDS = sorted(['arcsin', 'arccos', 'arctan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'sqrt', 'cbrt',
                'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'ln', 'log', 'exp', 'abs', 'theta', 'phi', 'pi',
                'rho', 'ph', 'th'], key=len, reverse=True)
TRANS = standard_transformations + (implicit_multiplication, implicit_application, convert_xor, rationalize)


def _split_word(run):
    out = []
    while run:
        low = run.lower()
        w = next((w for w in WORDS if low.startswith(w)), None)
        if w:
            out.append(w); run = run[len(w):]
        else:
            out.append('e' if run[0] in 'eE' else run[0].lower()); run = run[1:]
    return out


def _prep(s):
    s = str(s).replace('−', '-').replace('π', 'pi').replace('**', '^')
    toks = []
    for m in re.finditer(r'\d+\.?\d*|\.\d+|[A-Za-z]+|\S', s):
        tok = m.group(0)
        if tok[0].isalpha():
            toks.extend(_split_word(tok))
        else:
            toks.append(tok)
    # an identifier followed by a number (x2) never occurs in key syntax; keep tokens space-separated
    return ' '.join(toks)


_pcache = {}


def P(s):
    """page input syntax → sympy expression (vectors → list)."""
    if isinstance(s, (int, float)):
        return sp.nsimplify(s) if isinstance(s, float) and abs(s - round(s)) > 0 else sp.Integer(int(s)) if float(s).is_integer() else sp.Float(s)
    s = str(s).strip()
    if s in _pcache:
        return _pcache[s]
    if s.startswith('<') and s.endswith('>'):
        res = [P(c) for c in _split_top(s[1:-1])]
    else:
        res = parse_expr(_prep(s), local_dict=LOCAL, transformations=TRANS, evaluate=True)
    _pcache[s] = res
    return res


def _split_top(s):
    out, d, cur = [], 0, ''
    for c in s:
        if c in '(<': d += 1
        if c in ')>': d -= 1
        if c == ',' and d == 0:
            out.append(cur); cur = ''
        else:
            cur += c
    out.append(cur)
    return [c.strip() for c in out]


# ----------------------------------------------------------------- numbers
def fnum(e):
    """sympy/py value → python float or complex or None (non-finite / symbolic)."""
    try:
        if isinstance(e, (int, float)):
            v = float(e)
        else:
            e = sp.sympify(e)
            if e.free_symbols:
                return None
            c = complex(sp.N(e, 30))
            if abs(c.imag) > 1e-9 * max(1, abs(c.real)):
                return None
            v = c.real
        return v if math.isfinite(v) else None
    except Exception:
        return None


def close(a, b, rtol=RTOL, atol=ATOL):
    if a is None or b is None:
        return False
    if isinstance(a, (list, tuple)) or isinstance(b, (list, tuple)):
        if not isinstance(a, (list, tuple)) or not isinstance(b, (list, tuple)):
            return False
        L = max(len(a), len(b))
        a = list(a) + [0.0] * (L - len(a)); b = list(b) + [0.0] * (L - len(b))
        return all(close(p, q, rtol, atol) for p, q in zip(a, b))
    return abs(a - b) <= max(atol, rtol * max(abs(a), abs(b)))


class Timeout(Exception):
    pass


def _alarm(signum, frame):
    raise Timeout()


signal.signal(signal.SIGALRM, _alarm)


def with_timeout(fn, sec=EXACT_TIMEOUT):
    signal.alarm(sec)
    try:
        return fn()
    except Timeout:
        return None
    except Exception:
        return None
    finally:
        signal.alarm(0)


# ----------------------------------------------------------------- numeric quadrature (tanh-sinh, vectorised)
def _ts_nodes(h=1 / 24, T=3.3):
    k = np.arange(-int(T / h), int(T / h) + 1)
    tt = k * h
    s = 0.5 * np.pi * np.sinh(tt)
    xi = np.tanh(s)
    w = h * 0.5 * np.pi * np.cosh(tt) / np.cosh(s) ** 2
    # fraction along [0,1]: (1+xi)/2 computed stably
    frac = 1.0 / (1.0 + np.exp(-2 * s))
    keep = (w > 1e-300)
    return frac[keep], w[keep] / 2.0      # ∫_0^1 g ≈ Σ w g(frac)


TS_FRAC, TS_W = _ts_nodes()
TS_FRAC2, TS_W2 = _ts_nodes(1 / 12, 3.2)   # coarser set for 3-D


def _lam(expr, names):
    return sp.lambdify([SYM.get(n, sp.Symbol(n)) for n in names], expr, modules=['numpy'])


def _valid_lims(lims, extra=()):
    """each limit may only use variables integrated further out; else the 'integral' is not a number."""
    outer = set(SYM[l[0]] for l in lims)
    for i, (vn, lo, hi) in enumerate(lims):
        allowed = set(SYM[l[0]] for l in lims[i + 1:])
        if not (sp.sympify(lo).free_symbols | sp.sympify(hi).free_symbols) <= allowed:
            return False
    return True


def _nodes(lo, hi, FR, WT, split):
    """nodes/weights on [lo,hi] (arrays), optionally split at 0 when 0 lies strictly inside."""
    if not split:
        L = hi - lo
        return lo[:, None] + L[:, None] * FR[None, :], L[:, None] * WT[None, :]
    a, b = np.minimum(lo, hi), np.maximum(lo, hi)
    c = np.clip(0.0, a, b)
    c = np.where(np.isfinite(c), c, lo)
    L1, L2 = c - lo, hi - c
    X = np.concatenate([lo[:, None] + L1[:, None] * FR[None, :], c[:, None] + L2[:, None] * FR[None, :]], axis=1)
    Wt = np.concatenate([L1[:, None] * WT[None, :], L2[:, None] * WT[None, :]], axis=1)
    return X, Wt


def num_int(f, lims, fine=False):
    """∫…∫ f with lims innermost first; lo/hi may depend on outer variables.
    Vectorised tanh-sinh in every dimension; x, y, z intervals are split at 0 (singularities at the
    origin / on the axes then sit at node-free endpoints).  None when the limits are not well formed."""
    if not _valid_lims(lims):
        return None
    if (sp.sympify(f).free_symbols - set(SYM[l[0]] for l in lims)):
        return None
    order = list(reversed(lims))       # outermost first
    names = [l[0] for l in order]
    nd = len(order)
    if nd >= 3:
        FR, WT = _ts_nodes(1 / 16, 3.3) if fine else (TS_FRAC2, TS_W2)
    else:
        FR, WT = _ts_nodes(1 / 48, 3.6) if fine else (TS_FRAC, TS_W)
    lams = [(_lam(lo, names[:i]), _lam(hi, names[:i])) for i, (_, lo, hi) in enumerate(order)]
    fl = _lam(f, names)
    total = 0.0
    with np.errstate(all='ignore'):
        # outermost dimension in chunks to bound memory
        lo0 = float(np.asarray(lams[0][0](), dtype=float)); hi0 = float(np.asarray(lams[0][1](), dtype=float))
        X0, W0 = _nodes(np.array([lo0]), np.array([hi0]), FR, WT, names[0] in 'xyz')
        X0, W0 = X0.ravel(), W0.ravel()
        CH = 8 if nd >= 3 else 64
        for k in range(0, len(X0), CH):
            env = {names[0]: X0[k:k + CH]}
            W = W0[k:k + CH].copy()
            for i in range(1, nd):
                prev = names[:i]
                args = [env[n] for n in prev]
                LO = np.broadcast_to(np.asarray(lams[i][0](*args), dtype=float), W.shape).astype(float)
                HI = np.broadcast_to(np.asarray(lams[i][1](*args), dtype=float), W.shape).astype(float)
                bad = ~(np.isfinite(LO) & np.isfinite(HI))
                LO = np.where(bad, 0.0, LO); HI = np.where(bad, 0.0, HI)
                X, Wt = _nodes(LO, HI, FR, WT, names[i] in 'xyz')
                m = X.shape[1]
                W = (W[:, None] * Wt).ravel()
                for n in prev:
                    env[n] = np.repeat(env[n], m)
                env[names[i]] = X.ravel()
            F = fl(*[env[n] for n in names])
            F = np.asarray(F)
            if np.iscomplexobj(F):
                F = np.where(np.abs(F.imag) < 1e-12 * (1 + np.abs(F.real)), F.real, np.nan)
            F = np.broadcast_to(F.astype(float), W.shape)
            ok = np.isfinite(F) & np.isfinite(W)
            total += float(np.sum(np.where(ok, W * np.where(ok, F, 0.0), 0.0)))
    return total


def exact_int(f, lims):
    def go():
        e = f
        for (vn, lo, hi) in lims:
            e = sp.integrate(e, (SYM[vn], lo, hi))
            if e.has(sp.Integral):
                return None
        return e
    e = with_timeout(go)
    return None if e is None else fnum(e)


LAST_CTX = None


class Ctx:
    def __init__(self):
        self.notes = []      # checker-side notes (exact vs numeric disagreements etc.)
        self.asserts = []    # nested assertions (ratio.want inside pick, val.also)


def integral(f, lims, ctx, exact=True):
    f = P(f)
    L = [(l[0], P(l[1]), P(l[2])) for l in lims]
    if not _valid_lims(L):
        return None            # a limit uses an inner variable: not a number (counts as "different")
    nv = num_int(f, L)
    ev = exact_int(f, L) if exact else None
    if ev is not None and nv is not None and not close(ev, nv, 1e-6, 1e-8):
        # tie-break with a finer numeric rule: if the numeric value is stable under refinement it wins
        nf = num_int(f, L, fine=True)
        if nf is not None and close(nf, nv, 1e-7, 1e-9) and not close(nf, ev, 1e-6, 1e-8):
            ctx.notes.append(f'sympy {ev:.10g} rejected; numeric {nf:.10g} stable under refinement')
            return nf
        if nf is not None and close(nf, ev, 1e-6, 1e-8):
            return ev
        ctx.notes.append(f'exact {ev:.10g} vs numeric {nv:.10g} / fine {nf} unresolved; using exact')
        return ev
    if ev is None and nv is not None:
        nf = num_int(f, L, fine=True)        # numeric only: report the refined value, note if it moved
        if nf is not None and not close(nf, nv, 1e-6, 1e-8):
            ctx.notes.append(f'numeric only, not converged: {nv:.10g} → {nf:.10g}')
        return nf if nf is not None else nv
    return ev if ev is not None else nv


def num1d(expr, var, a, b):
    """1-D numeric integral (mpmath tanh-sinh, high precision)."""
    import mpmath
    fl = sp.lambdify([var], expr, modules=['mpmath'])
    try:
        with mpmath.workdps(30):
            A, B = mpmath.mpf(fnum(a)), mpmath.mpf(fnum(b))
            vv = mpmath.quad(lambda s: fl(s), mpmath.linspace(A, B, 13))
        c = complex(vv)
        if abs(c.imag) > 1e-8 * max(1, abs(c.real)):
            return None
        return c.real
    except Exception:
        return num_int(expr, [(str(var), a, b)])


def int1(expr, var, a, b, ctx, exact=True):
    nv = num1d(expr, var, a, b)
    ev = None
    if exact:
        def go():
            e = sp.integrate(sp.simplify(expr), (var, a, b))
            return None if e.has(sp.Integral) else e
        e = with_timeout(go)
        ev = None if e is None else fnum(e)
    if ev is not None and nv is not None and not close(ev, nv, 1e-6, 1e-8):
        # sympy antiderivatives of rational trig integrands can jump across branch cuts (atan);
        # mpmath tanh-sinh at 30 digits on a 1-D smooth integrand is the reliable one: use it
        ctx.notes.append(f'1-D sympy {ev:.10g} rejected for mpmath {nv:.10g}')
        return nv
    return ev if ev is not None else nv


# ----------------------------------------------------------------- identically-zero tests
_rng = random.Random(1234)
TEST_PTS = [tuple(_rng.uniform(0.25, 1.9) * _rng.choice([1, -1]) for _ in range(3)) for _ in range(8)] + \
           [tuple(_rng.uniform(0.25, 1.9) for _ in range(3)) for _ in range(4)]


def is_zero(e, vars_=(x, y, z)):
    """True when e ≡ 0 (numeric at 12 random points, confirmed by simplify when cheap)."""
    e = sp.sympify(e)
    vals = []
    for p in TEST_PTS:
        sub = dict(zip(vars_, p))
        try:
            c = complex(sp.N(e.subs(sub), 20))
        except Exception:
            continue
        if not (math.isfinite(c.real) and math.isfinite(c.imag)):
            continue
        vals.append(abs(c))
    if len(vals) < 4:
        s = with_timeout(lambda: sp.simplify(e), 10)
        return s == 0
    return max(vals) < 1e-9


def curl3(F):
    P_, Q_, R_ = [P(c) for c in F] + [sp.Integer(0)] * (3 - len(F))
    return [sp.diff(R_, y) - sp.diff(Q_, z), sp.diff(P_, z) - sp.diff(R_, x), sp.diff(Q_, x) - sp.diff(P_, y)]


def grad3(f):
    f = P(f)
    return [sp.diff(f, x), sp.diff(f, y), sp.diff(f, z)]


# ----------------------------------------------------------------- line / surface integrals
def ls_val(c, ctx, exact=True):
    f = P(c['f']); R = [P(q) for q in c['r']]
    while len(R) < 3:
        R.append(sp.Integer(0))
    a, b = P(c['t'][0]), P(c['t'][1])
    speed = sp.sqrt(sum(sp.diff(q, t) ** 2 for q in R))
    integrand = f.subs({x: R[0], y: R[1], z: R[2]}, simultaneous=True) * speed
    return int1(integrand, t, a, b, ctx, exact)


def lv_expr(F, R):
    F = [P(q) for q in F]
    R = [P(q) for q in R]
    sub = dict(zip([x, y, z], R))
    return sum(Fi.subs(sub, simultaneous=True) * sp.diff(Ri, t) for Fi, Ri in zip(F, R))


def lv_val(c, ctx, exact=True):
    return int1(lv_expr(c['F'], c['r']), t, P(c['t'][0]), P(c['t'][1]), ctx, exact)


def fluxc_expr(F, R):
    Pq, Qq = P(F[0]), P(F[1]); X, Y = P(R[0]), P(R[1])
    sub = {x: X, y: Y}
    return Pq.subs(sub, simultaneous=True) * sp.diff(Y, t) - Qq.subs(sub, simultaneous=True) * sp.diff(X, t)


def seg(A, B):
    A = [P(a) for a in A]; B = [P(b) for b in B]
    return [A[i] + t * (B[i] - A[i]) for i in range(len(A))]


def poly_val(c, ctx, flux, exact=True):
    tot = 0.0
    pts = c['poly']
    for A, B in zip(pts[:-1], pts[1:]):
        R = seg(A, B)
        e = fluxc_expr(c['F'], R) if flux else lv_expr(c['F'], R)
        val = int1(e, t, 0, 1, ctx, exact)
        if val is None:
            return None
        tot += val
    return tot


def surf_val(c, ctx, exact=True):
    f = P(c['f']); R = [P(q) for q in c['r']]
    ru = [sp.diff(q, u) for q in R]; rv = [sp.diff(q, v) for q in R]
    cr = [ru[1] * rv[2] - ru[2] * rv[1], ru[2] * rv[0] - ru[0] * rv[2], ru[0] * rv[1] - ru[1] * rv[0]]
    nrm2 = sum(q ** 2 for q in cr)
    integrand_num = f.subs({x: R[0], y: R[1], z: R[2]}, simultaneous=True) * sp.sqrt(nrm2)
    lims = [(l[0], P(l[1]), P(l[2])) for l in c['lim']]
    nv = num_int(integrand_num, lims)
    ev = None
    if exact:
        def go():
            n2 = sp.trigsimp(sp.factor(sp.expand(nrm2)))
            e = f.subs({x: R[0], y: R[1], z: R[2]}, simultaneous=True) * sp.sqrt(n2)
            for (vn, lo, hi) in lims:
                e = sp.integrate(e, (SYM[vn], lo, hi))
                if e.has(sp.Integral):
                    return None
            return e
        e = with_timeout(go)
        ev = None if e is None else fnum(e)
    if ev is not None and nv is not None and not close(ev, nv, 1e-5, 1e-7):
        ctx.notes.append(f'surf exact {ev:.10g} vs numeric {nv:.10g} (exact dropped: |sin| etc.)')
        return nv           # sqrt(sin^2) branch issues: trust the numeric value here
    return ev if ev is not None else nv


# ----------------------------------------------------------------- Lagrange
def lagr_points(c):
    vs = [SYM[n] for n in c['vars']]
    f, g, cc = P(c['f']), P(c['g']), P(c['c'])
    lam = sp.Symbol('lam')
    eqs = [sp.diff(f, q) - lam * sp.diff(g, q) for q in vs] + [g - cc]

    def go():
        return sp.solve(eqs, vs + [lam], dict=True)
    sols = with_timeout(go, 30)
    if sols is None:
        return None
    pts = []
    for s in sols:
        try:
            p = [complex(sp.N(s[q], 30)) for q in vs]
            l = complex(sp.N(s.get(lam, sp.nan), 30))
        except Exception:
            continue
        if any(abs(q.imag) > 1e-9 for q in p):
            continue
        p = [q.real for q in p]
        if c.get('pos') and not all(q > 0 for q in p):
            continue
        fv = complex(sp.N(f.subs({q: s[q] for q in vs}), 30)).real
        pts.append((fv, p, l.real))
    # also g's singular points on the constraint (∇g = 0) are candidates
    return pts


def lagr_numeric(c, seed=7):
    """projected-gradient sweep on g = c from many random starts → (max, min)."""
    vs = [SYM[n] for n in c['vars']]
    f, g, cc = P(c['f']), P(c['g']), float(fnum(P(c['c'])))
    fl = sp.lambdify(vs, f, 'numpy'); gl = sp.lambdify(vs, g, 'numpy')
    gfl = [sp.lambdify(vs, sp.diff(f, q), 'numpy') for q in vs]
    ggl = [sp.lambdify(vs, sp.diff(g, q), 'numpy') for q in vs]
    rng = np.random.default_rng(seed)
    n = len(vs); M = 4000
    pos = bool(c.get('pos'))
    X = rng.uniform(0.01 if pos else -6, 6, size=(n, M))

    def proj(X):
        for _ in range(25):
            G = np.array([np.broadcast_to(q(*X), (M,)) for q in ggl], dtype=float)
            gv = gl(*X) - cc
            nn = np.sum(G * G, axis=0) + 1e-300
            X = X - G * gv / nn
            if pos:
                X = np.abs(X) + 1e-12
        return X
    best = {}
    with np.errstate(all='ignore'):
        X = proj(X)
        for sgn in (1, -1):
            Y = X.copy()
            step = 0.05
            for it in range(250):
                Gf = np.array([np.broadcast_to(q(*Y), (M,)) for q in gfl], dtype=float)
                Gg = np.array([np.broadcast_to(q(*Y), (M,)) for q in ggl], dtype=float)
                nn = np.sum(Gg * Gg, axis=0) + 1e-300
                tang = Gf - Gg * np.sum(Gf * Gg, axis=0) / nn
                tn = np.sqrt(np.sum(tang * tang, axis=0)) + 1e-300
                Y = Y + sgn * step * tang / np.maximum(1.0, tn) * (1 if it < 150 else 0.2 if it < 220 else 0.03)
                Y = proj(Y)
            ok = np.abs(gl(*Y) - cc) < 1e-7 * max(1, abs(cc))
            if pos:
                ok &= np.all(Y > 0, axis=0)
            fv = np.broadcast_to(fl(*Y), (M,))[ok]
            fv = fv[np.isfinite(fv)]
            if len(fv):
                best[sgn] = (fv.max() if sgn == 1 else fv.min())
    return best.get(1), best.get(-1)


def lagr_val(c, ctx, kind):
    pts = lagr_points(c)
    nmax, nmin = lagr_numeric(c)
    if pts:
        vals = [p[0] for p in pts]
        smax, smin = max(vals), min(vals)
        # the sympy critical-point set must match the numeric sweep (catches missed points / unbounded sets)
        if nmax is not None and not close(smax, nmax, 1e-4, 1e-6) and c['want'] in ('max', 'range'):
            ctx.notes.append(f'lagr: sympy max {smax} vs sweep {nmax}')
            if nmax > smax + 1e-6:
                smax = float('inf')   # unbounded or missed: the claimed max cannot be right
        if nmin is not None and not close(smin, nmin, 1e-4, 1e-6) and c['want'] in ('min', 'range'):
            ctx.notes.append(f'lagr: sympy min {smin} vs sweep {nmin}')
            if nmin < smin - 1e-6:
                smin = float('-inf')
    else:
        ctx.notes.append('lagr: sympy solve failed; numeric sweep only (1e-4 tolerance)')
        smax, smin = nmax, nmin
        if smax is None:
            return None
    if kind == 'lam':
        best = max(pts, key=lambda p: p[0]) if pts else None
        return None if best is None else best[2]
    w = c['want']
    v = smax if w == 'max' else smin if w == 'min' else smax - smin
    return v if v is not None and math.isfinite(v) else None


# ----------------------------------------------------------------- spec evaluation
_vcache = {}


def value(c, ctx, exact=True):
    """numeric value of a value-spec (None when it cannot be computed); memoised per process."""
    key = json.dumps(c, sort_keys=True)
    hit = _vcache.get((key, True)) or (_vcache.get((key, False)) if not exact else None)
    if hit is None:
        sub = Ctx()
        val = _value(c, sub, exact)
        hit = (val, sub.notes, sub.asserts)
        _vcache[(key, exact)] = hit
    ctx.notes.extend(hit[1]); ctx.asserts.extend(hit[2])
    return hit[0]


def _value(c, ctx, exact=True):
    op = c['op']
    if op == 'int':
        return integral(c['f'], c['lim'], ctx, exact)
    if op == 'sum':
        vals = [value(s, ctx, exact) for s in c['of']]
        return None if any(q is None for q in vals) else sum(vals)
    if op == 'ratio':
        a, b = value(c['num'], ctx, exact), value(c['den'], ctx, exact)
        if a is None or b is None or b == 0:
            return None
        rv = a / b
        if 'want' in c:
            ctx.asserts.append(('ratio.want', rv, fnum(P(c['want']))))
        return rv
    if op == 'val':
        ev = fnum(P(c['e']))
        if 'also' in c or 'alsoeq' in c:
            ctx.asserts.append(('val.also≈alsoeq', value(c['also'], ctx, exact), value(c['alsoeq'], ctx, exact)))
        return ev
    if op == 'lagr':
        return lagr_val(c, ctx, 'val')
    if op == 'lagrlam':
        return lagr_val(dict(c, want='max'), ctx, 'lam')
    if op == 'distfoot':
        n = [P(q) for q in c['n']]; d = P(c['d']); Pt = [P(q) for q in c['P']]
        k = (sum(a * b for a, b in zip(n, Pt)) - d) / sum(a * a for a in n)
        return fnum(Pt[c['idx']] - k * n[c['idx']])
    if op == 'riemann':
        f = P(c['f'])
        return fnum(sum(f.subs({x: P(p[0]), y: P(p[1])}) for p in c['pts']) * P(c['dA']))
    if op == 'ls':
        return ls_val(c, ctx, exact)
    if op == 'lv':
        return lv_val(c, ctx, exact)
    if op == 'fluxc':
        return int1(fluxc_expr(c['F'], c['r']), t, P(c['t'][0]), P(c['t'][1]), ctx, exact)
    if op == 'lvpoly':
        return poly_val(c, ctx, False, exact)
    if op == 'fluxpoly':
        return poly_val(c, ctx, True, exact)
    if op == 'surf':
        return surf_val(c, ctx, exact)
    if op == 'curlmag':
        cv = [fnum(q) for q in curl3(c['F'])]
        if any(q is None for q in cv):
            return None
        m = math.sqrt(sum(q * q for q in cv))
        return m / 2 if c.get('half') else m
    if op == 'div':
        F = [P(q) for q in c['F']] + [0] * (3 - len(c['F']))
        dv = sp.diff(F[0], x) + sp.diff(F[1], y) + sp.diff(F[2], z)
        return fnum(dv.subs(dict(zip([x, y, z], [P(q) for q in c['at']]))))
    if op == 'lap':
        f = P(c['f']); L = sum(sp.diff(f, q, 2) for q in (x, y, z))
        return fnum(L.subs(dict(zip([x, y, z], [P(q) for q in c['at']]))))
    raise KeyError('not a value op: ' + op)


VALUE_OPS = {'int', 'sum', 'ratio', 'val', 'lagr', 'lagrlam', 'distfoot', 'riemann', 'ls', 'lv', 'fluxc',
             'lvpoly', 'fluxpoly', 'surf', 'curlmag', 'div', 'lap'}


def same_field(A, B, n=3):
    return all(is_zero(P(a) - P(b)) for a, b in zip(list(A) + ['0'] * (n - len(A)), list(B) + ['0'] * (n - len(B))))


def check(s, ansval_override=None, exact=True):
    """→ (status, message, computed).  status ∈ pass | fail | skip."""
    global LAST_CTX
    c = s['chk']
    op = c.get('op')
    ctx = Ctx()
    LAST_CTX = ctx
    kind = s['kind']
    ansv = ansval_override
    if ansv is None and kind in ('expr', 'vec') and s.get('ans') is not None:
        try:
            pa = P(s['ans'])
            ansv = [fnum(q) for q in pa] if isinstance(pa, list) else fnum(pa)
        except Exception as e:
            return 'fail', f'ans "{s["ans"]}" does not convert: {e}', None

    def finish(ok, msg, comp):
        for (name, a, b) in ctx.asserts:
            if not close(a, b):
                return 'fail', f'{name}: {a} vs {b}', comp
        return ('pass' if ok else 'fail'), msg, comp

    if op in ('none', 'manual'):
        return 'skip', 'op ' + str(op), None
    if op in VALUE_OPS:
        if op == 'ratio' and 'want' in c:
            vv = value(c, ctx, exact)
            ctx.asserts.clear()
            want = fnum(P(c['want']))
            return finish(close(vv, want), f'ratio {vv} vs want {want}', vv)
        vv = value(c, ctx, exact)
        if vv is None:
            return 'fail', 'checker could not compute a value' + ('; ' + '; '.join(ctx.notes) if ctx.notes else ''), None
        if ansv is None:
            return 'fail', f'ans "{s.get("ans")}" has no numeric value', vv
        return finish(close(vv, ansv), f'computed {vv!r} vs ans {ansv!r}' + ('  [' + '; '.join(ctx.notes) + ']' if ctx.notes else ''), vv)

    if op in ('pick', 'pickdiff'):
        ref = value(c['ref'], ctx, exact)
        if ref is None:
            return 'fail', 'ref could not be computed', None
        opts = c['opts']
        bad = []
        for i, o in enumerate(opts):
            if o is None:
                continue
            if not isinstance(o, dict):
                bad.append(f'opt{i} is not a spec ({str(o)[:40]})')
                continue
            ov = value(o, ctx, exact)
            eq = close(ov, ref)
            want_eq = (i == 0) if op == 'pick' else (i != 0)
            if eq != want_eq:
                bad.append(f'opt{i}={ov} {"should equal" if want_eq else "must differ from"} ref={ref}')
        return finish(not bad, '; '.join(bad) or f'ref {ref}', ref)

    if op == 'ftli':
        cu = curl3(c['F'])
        cons = all(is_zero(q) for q in cu)
        if c['cons']:
            if not cons:
                return 'fail', 'F is not conservative but cons=1', None
            vv = lv_val({'F': c['F'], 'r': seg(c['A'], c['B']), 't': [0, 1]}, ctx, exact)
            return finish(close(vv, ansv), f'segment integral {vv} vs ans {ansv}', vv)
        else:
            if cons:
                return 'fail', 'F is conservative but cons=0', None
            key = (s.get('opts') or [{}])[0].get('h', '') if s.get('opts') else str(s.get('ans'))
            ok = 'Impossible' in key or 'impossible' in key
            return finish(ok, f'key option text: {key[:60]}', None)

    if op == 'ftli2':
        Pq, Qq = P(c['F'][0]), P(c['F'][1])
        if not is_zero(sp.diff(Qq, x) - sp.diff(Pq, y)):
            return 'fail', 'Q_x ≠ P_y', None
        vv = lv_val({'F': c['F'], 'r': seg(c['A'], c['B']), 't': [0, 1]}, ctx, exact)
        return finish(close(vv, ansv), f'segment integral {vv} vs ans {ansv}', vv)

    if op == 'pot':
        F = [P(q) for q in c['F']]
        cons = all(is_zero(q) for q in curl3(c['F']))
        opts = c['opts']
        bad = []
        if opts[0] is None:
            if cons:
                bad.append('key says no potential exists, but curl F ≡ 0')
        else:
            if not cons:
                bad.append('F not conservative but a potential is keyed')
            for i, o in enumerate(opts):
                if o is None:
                    continue
                g = grad3(o)
                okg = all(is_zero(g[k] - F[k]) for k in range(3))
                if okg != (i == 0):
                    bad.append(f'opt{i} φ={o}: ∇φ {"≠" if i == 0 else "="} F')
        return finish(not bad, '; '.join(bad) or 'ok', None)

    if op == 'conswhich':
        bad = []
        for i, F in enumerate(c['opts']):
            cons = all(is_zero(q) for q in curl3(F))
            if cons != (i == 0):
                bad.append(f'opt{i} {F} curl {"≢" if i == 0 else "≡"} 0')
        return finish(not bad, '; '.join(bad) or 'ok', None)

    if op == 'curl':
        cu = curl3(c['F'])
        bad = []
        for i, o in enumerate(c['opts']):
            vv = P(o)
            same = all(is_zero(vv[k] - cu[k]) for k in range(3))
            if same != (i == 0):
                bad.append(f'opt{i} {o} {"≠" if i == 0 else "="} curl F = {cu}')
        return finish(not bad, '; '.join(bad) or 'ok', None)

    if op == 'curl1':
        cu = curl3(c['F'])
        ok = all(is_zero(cu[k] - P(c['want'][k])) for k in range(3))
        ok2 = ansv is None or close(ansv, [fnum(P(q)) for q in c['want']])
        return finish(ok and ok2, f'curl {cu} want {c["want"]} ans {ansv}', None)

    if op == 'grad':
        g = grad3(c['f'])
        at = dict(zip([x, y, z], [P(q) for q in c['at']]))
        gv = [fnum(q.subs(at)) for q in g]
        want = [fnum(P(q)) for q in c['want']]
        ok = close(gv, want) and close(ansv, want)
        return finish(ok, f'∇f(at)={gv} want={want} ans={ansv}', gv)

    if op == 'normal':
        g = P(c['g'])
        gx, gy = sp.diff(g, x), sp.diff(g, y)
        bad = []
        for i, (Pq, Qq) in enumerate(c['opts']):
            Pq, Qq = P(Pq), P(Qq)
            if c['tangent']:
                passes = is_zero(Pq * gx + Qq * gy) and not (is_zero(Pq) and is_zero(Qq))
            else:
                passes = is_zero(Pq * gy - Qq * gx) and not (is_zero(Pq) and is_zero(Qq))
            if passes != (i == 0):
                bad.append(f'opt{i} <{Pq}, {Qq}> {"fails" if i == 0 else "passes"} the {"tangent" if c["tangent"] else "normal"} test')
        return finish(not bad, '; '.join(bad) or 'ok', None)

    if op == 'fields':
        key = [P(q) for q in c['key']]
        grid = [(a, b) for a in np.linspace(-2, 2, 5) for b in np.linspace(-2, 2, 5)]

        def ev(F, p):
            return [fnum(sp.sympify(q).subs({x: sp.Rational(p[0]).limit_denominator(100), y: sp.Rational(p[1]).limit_denominator(100)})) for q in F]

        def same_dir(a, b):
            if a[0] is None or b[0] is None or a[1] is None or b[1] is None:
                return False
            na, nb = math.hypot(*a), math.hypot(*b)
            if na < 1e-12 and nb < 1e-12:
                return True
            if na < 1e-12 or nb < 1e-12:
                return False
            return abs(a[0] * b[1] - a[1] * b[0]) < 1e-9 * na * nb and a[0] * b[0] + a[1] * b[1] > 0
        kv = [ev(key, p) for p in grid]
        bad = []
        for i, F in enumerate(c['opts']):
            Fv = [P(q) for q in F]
            if i == 0:
                if not (is_zero(Fv[0] - key[0]) and is_zero(Fv[1] - key[1])):
                    bad.append(f'opt0 {F} ≠ key {c["key"]}')
            else:
                if all(same_dir(ev(Fv, p), kk) for p, kk in zip(grid, kv)):
                    bad.append(f'opt{i} {F} points like the key everywhere on the grid')
        return finish(not bad, '; '.join(bad) or 'ok', None)

    if op == 'area':
        bad = []
        for i, o in enumerate(c['opts']):
            a_, b_ = o['c']
            fct = sp.Rational(b_ - a_, o['k']) if isinstance(a_, int) and isinstance(b_, int) else (b_ - a_) / o['k']
            is_area = fnum(fct) is not None and close(fnum(fct), 1.0)
            want_area = (i != 0) if c['not'] else (i == 0)
            if is_area != want_area:
                bad.append(f'opt{i} factor {fct} ({"is" if is_area else "is not"} the area)')
        return finish(not bad, '; '.join(bad) or 'ok', None)

    return 'fail', f'unknown op {op}', None


# ----------------------------------------------------------------- per-sample driver
def conv_check(s):
    """ans / distractor / option strings: python value vs the page's own value."""
    probs = []
    pairs = []
    if s['kind'] in ('expr', 'vec') and s.get('ansNum') is not None:
        pairs.append(('ans', s['ans'], s['ansNum']))
    for i, d in enumerate(s.get('dis') or []):
        if d.get('a') is not None and d.get('num') is not None:
            pairs.append((f'dis{i}', d['a'], d['num']))
    for i, o in enumerate(s.get('opts') or []):
        if o.get('a') is not None and o.get('num') is not None:
            pairs.append((f'opt{i}', o['a'], o['num']))
    for name, st, nv in pairs:
        try:
            pv = P(st)
            pv = [fnum(q) for q in pv] if isinstance(pv, list) else fnum(pv)
        except Exception as e:
            probs.append(f'{name} "{st}" does not convert ({e})')
            continue
        if not close(pv, nv, 1e-9, 1e-12):
            probs.append(f'{name} "{st}": sympy {pv} vs page {nv}')
    return probs


def wrong_values(s):
    """the strings shown as WRONG answers that carry a value: (label, string, page value)."""
    out = []
    for i, d in enumerate(s.get('dis') or []):
        if d.get('a') is not None and d.get('num') is not None:
            out.append((f'dis{i}', d['a'], d['num']))
    if s['src'] == 'exam':
        for i, o in enumerate(s.get('opts') or []):
            if i and o.get('a') is not None and o.get('num') is not None:
                out.append((f'opt{i}', o['a'], o['num']))
    return out


def run_sample(s, do_mutate=True):
    res = {'id': s['id'], 'src': s['src'], 'text': s.get('text', '')[:160], 'ans': s.get('ans')}
    try:
        res['conv'] = conv_check(s)
        st, msg, comp = check(s)
        res.update(status=st, msg=msg, comp=comp, notes=list(LAST_CTX.notes) if LAST_CTX else [])
        # a distractor that equals the correct value
        res['diskey'] = []
        if st == 'pass' and isinstance(comp, float):
            for lab, a, nv in wrong_values(s):
                if close(nv, comp):
                    res['diskey'].append(f'{lab} "{a}" = {nv} equals the true value')
        # mutation: the key replaced by a wrong answer must fail
        res['mut'] = None
        if do_mutate and st == 'pass':
            mut = None
            if s['kind'] in ('expr', 'vec') and s['chk']['op'] not in ('none',):
                wv = [w for w in wrong_values(s) if not close(w[2], s.get('ansNum'))]
                if wv and s.get('ansNum') is not None:
                    mut = wv[0]
                    st2, _, _ = check(s, ansval_override=mut[2], exact=False)
                    res['mut'] = (st2 == 'fail', f'ans→{mut[1]}')
            elif s['kind'] == 'choice' or s['chk']['op'] in ('pick', 'pickdiff', 'pot', 'conswhich', 'curl', 'normal', 'fields', 'area'):
                c = s['chk']
                if 'opts' in c and isinstance(c['opts'], list):
                    idx = [i for i, o in enumerate(c['opts']) if i and o is not None and not (isinstance(o, str) and c['op'] in ('pick', 'pickdiff'))]
                    if c['op'] == 'pot' and c['opts'][0] is None:
                        idx = []
                    if idx and c['opts'][0] is not None:
                        o2 = list(c['opts']); j = idx[0]
                        o2[0], o2[j] = o2[j], o2[0]
                        s2 = dict(s, chk=dict(c, opts=o2))
                        st2, _, _ = check(s2, exact=False)
                        res['mut'] = (st2 == 'fail', f'swap opt0/opt{j}')
    except Exception as e:
        res.update(status='fail', msg='CHECKER EXCEPTION ' + repr(e) + ' ' + traceback.format_exc().splitlines()[-2][:200], comp=None, conv=res.get('conv', []), diskey=[], mut=None, notes=[])
    return res


def _run_star(args):
    return run_sample(*args)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('samples', nargs='?', default=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'samples.json'))
    ap.add_argument('--only', default='')
    ap.add_argument('--jobs', type=int, default=max(1, (os.cpu_count() or 2) - 1))
    ap.add_argument('--no-mutate', action='store_true')
    ap.add_argument('-v', action='store_true')
    a = ap.parse_args()
    samples = [s for s in json.load(open(a.samples)) if s['id'].startswith(a.only)]
    if a.jobs > 1:
        import multiprocessing as mp
        with mp.get_context('fork').Pool(a.jobs) as pool:
            results = []
            for i, r in enumerate(pool.imap(_run_star, [(s, not a.no_mutate) for s in samples], chunksize=1)):
                results.append(r)
                if (i + 1) % 100 == 0:
                    print(f'  … {i + 1}/{len(samples)}', file=sys.stderr, flush=True)
    else:
        results = [run_sample(s, not a.no_mutate) for s in samples]

    by = OrderedDict()
    for r in results:
        by.setdefault((r['src'], r['id']), []).append(r)
    tot = dict(samples=0, passed=0, failed=0, skipped=0, conv=0, diskey=0, mut=0, mutc=0)
    lines = []
    print(f'{"id":24s} {"src":6s} {"n":>3s} {"pass":>4s} {"fail":>4s} {"skip":>4s} {"conv":>4s} {"dis=key":>7s} {"mutants":>8s}')
    for (src, id_), rs in by.items():
        n = len(rs); p = sum(r['status'] == 'pass' for r in rs); f = sum(r['status'] == 'fail' for r in rs)
        sk = sum(r['status'] == 'skip' for r in rs)
        cv = sum(bool(r['conv']) for r in rs); dk = sum(bool(r['diskey']) for r in rs)
        mu = [r['mut'] for r in rs if r.get('mut')]
        mc = sum(m[0] for m in mu)
        tot['samples'] += n; tot['passed'] += p; tot['failed'] += f; tot['skipped'] += sk
        tot['conv'] += cv; tot['diskey'] += dk; tot['mut'] += len(mu); tot['mutc'] += mc
        flag = f or cv or dk or (mu and mc < len(mu))
        if flag or a.v:
            print(f'{id_:24s} {src:6s} {n:3d} {p:4d} {f:4d} {sk:4d} {cv:4d} {dk:7d} {f"{mc}/{len(mu)}":>8s}')
            ex = next((r for r in rs if r['status'] == 'fail'), None)
            if ex:
                print(f'    FAIL e.g.: {ex["text"][:150]}\n      ans={ex["ans"]!s:.80}  →  {ex["msg"][:300]}')
            ex = next((r for r in rs if r['conv']), None)
            if ex:
                print(f'    CONVERSION: {ex["conv"][0][:200]}')
            ex = next((r for r in rs if r['diskey']), None)
            if ex:
                print(f'    DISTRACTOR=KEY: ans={ex["ans"]}  {ex["diskey"][0][:160]}  | {ex["text"][:100]}')
            ex = next((r for r in rs if r.get('mut') and not r['mut'][0]), None)
            if ex:
                print(f'    MUTANT SURVIVED: {ex["mut"][1][:100]}  | {ex["text"][:100]}')
    noted = [r for r in results if r.get('notes')]
    if noted:
        print(f'\nchecker notes (exact/numeric disagreements resolved, numeric-only values) on {len(noted)} samples:')
        seen = set()
        for r in noted:
            k = (r['id'], r['notes'][0][:40])
            if k in seen:
                continue
            seen.add(k)
            print(f'  {r["id"]:22s} [{r["status"]}] {r["notes"][0][:200]}')
    ids = len(by)
    print(f'\nids {ids} · samples {tot["samples"]} · pass {tot["passed"]} · FAIL {tot["failed"]} · skipped(op none) {tot["skipped"]}'
          f' · conversion mismatches {tot["conv"]} · distractor=true value {tot["diskey"]}'
          f' · mutants caught {tot["mutc"]}/{tot["mut"]} ({100 * tot["mutc"] / max(1, tot["mut"]):.1f}%)')
    sys.exit(1 if (tot['failed'] or tot['conv']) else 0)


if __name__ == '__main__':
    main()
