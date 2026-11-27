# Dwa okragle logotypy: Velo Sudety (kanal YouTube) i "Obiekt przyjazny Rowerzystom".
# Napisy zamienione na krzywe (font Archivo, SIL OFL), wiec plik wyglada tak samo wszedzie, takze w drukarni.
import math, os, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

R = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(R, 'strona', 'assets', 'logo')
FONT_SRC = os.path.join(R, '_src_font', 'Archivo.ttf')
os.makedirs(OUT, exist_ok=True)

_f = TTFont(FONT_SRC)
FONT = instancer.instantiateVariableFont(_f, {'wght': 820, 'wdth': 100})
FONT_C = instancer.instantiateVariableFont(TTFont(FONT_SRC), {'wght': 820, 'wdth': 78})
CMAP = FONT.getBestCmap(); UPM = FONT['head'].unitsPerEm
def use(f):
    global GS, HM
    GS = f.getGlyphSet(); HM = f['hmtx']
use(FONT)

NAVY = '#17325C'; RED = '#E30613'; INK = '#1D2433'

def glyph(ch):
    return CMAP[ord(ch)]

def text_w(s, size, track=0):
    k = size / UPM
    return sum(HM[glyph(c)][0] * k for c in s) + track * size * (len(s) - 1)

def glyph_path(ch, size, tx, ty, rot_deg, cx_off):
    # sciezka litery: punkt (cx_off, 0) w ukladzie litery trafia w (tx, ty), obrot rot_deg
    k = size / UPM
    a = math.radians(rot_deg); ca, sa = math.cos(a), math.sin(a)
    # macierz: skala k, odbicie y, przesuniecie -cx_off, obrot, przesuniecie (tx, ty)
    m = (k * ca, k * sa, k * sa, -k * ca, 0, 0)
    ox = -cx_off * ca + tx; oy = -cx_off * sa + ty
    pen = SVGPathPen(GS)
    tp = TransformPen(pen, (m[0], m[1], m[2], m[3], ox, oy))
    GS[glyph(ch)].draw(tp)
    return pen.getCommands()

def arc_text(s, size, r, cx, cy, top=True, track=0.02, gap_before=0, icon=None):
    """Napis na luku. top=True: litery na gorze kola, czytane zgodnie z ruchem wskazowek;
    top=False: na dole, litery prosto (czytane od lewej do prawej). icon: (szerokosc, funkcja rysujaca w ukladzie lokalnym)"""
    k = size / UPM
    ws = [HM[glyph(c)][0] * k for c in s]
    trk = track * size
    total = sum(ws) + trk * (len(s) - 1)
    iw = 0
    if icon: iw = icon[0] + gap_before
    total_all = total + iw
    span = total_all / r
    out = []
    if top:
        th = -math.pi / 2 - span / 2
        if icon:
            mid = th + (icon[0] / 2) / r
            x = cx + r * math.cos(mid); y = cy + r * math.sin(mid)
            out.append(f'<g transform="translate({x:.2f} {y:.2f}) rotate({math.degrees(mid) + 90:.3f})">{icon[1]}</g>')
            th += iw / r
        for c, w in zip(s, ws):
            mid = th + (w / 2) / r
            x = cx + r * math.cos(mid); y = cy + r * math.sin(mid)
            if c != ' ':
                out.append(f'<path d="{glyph_path(c, size, x, y, math.degrees(mid) + 90, w / 2 / k * k)}"/>')
            th += (w + trk) / r
    else:
        th = math.pi / 2 + span / 2
        for c, w in zip(s, ws):
            mid = th - (w / 2) / r
            x = cx + r * math.cos(mid); y = cy + r * math.sin(mid)
            if c != ' ':
                out.append(f'<path d="{glyph_path(c, size, x, y, math.degrees(mid) - 90, w / 2)}"/>')
            th -= (w + trk) / r
    return ''.join(out)

def line_text(s, size, cx, baseline_y, track=0.01):
    k = size / UPM
    total = text_w(s, size, track)
    x = cx - total / 2; out = []
    for c in s:
        w = HM[glyph(c)][0] * k
        if c != ' ':
            out.append(f'<path d="{glyph_path(c, size, x + w / 2, baseline_y, 0, w / 2)}"/>')
        x += w + track * size
    return ''.join(out)

def yt_icon(h):
    # ikona YouTube: czerwony zaokraglony prostokat z bialym trojkatem; (0,0) = srodek dolnej krawedzi napisu
    w = h * 1.4
    return w, (f'<g transform="translate({-w/2:.2f} {-h*0.98:.2f})"><rect width="{w:.2f}" height="{h:.2f}" rx="{h*0.28:.2f}" fill="{RED}"/>'
               f'<path d="M{w*0.40:.2f} {h*0.27:.2f}v{h*0.46:.2f}l{w*0.29:.2f} {-h*0.23:.2f}z" fill="#fff"/></g>')

# ------------------------------------------------------------------ elementy sceny (styl rysunkowy)
OL = f'stroke="{INK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"'

def sky(id_, c1, c2):
    return f'<linearGradient id="{id_}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient>'

def sun(x, y, r):
    rays = ''.join(f'<path d="M{x + (r + 16) * math.cos(a):.1f} {y + (r + 16) * math.sin(a):.1f}L{x + (r + 44) * math.cos(a):.1f} {y + (r + 44) * math.sin(a):.1f}" stroke="#FFC400" stroke-width="12" stroke-linecap="round"/>'
                   for a in [i * math.pi / 6 for i in range(12)])
    return rays + f'<circle cx="{x}" cy="{y}" r="{r}" fill="#FFD43B" {OL}/>'

def cloud(x, y, s):
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="M-60 20h120a26 26 0 0 0-6-51 34 34 0 0 0-62-14 28 28 0 0 0-46 22 22 22 0 0 0-6 43z" fill="#fff" {OL.replace("7", "6")}/></g>')

def pine(x, y, h, c='#2E9E4F', d='#1F7A3A'):
    w = h * 0.55
    return (f'<path d="M{x} {y - h}L{x + w / 2} {y - h * 0.18}H{x - w / 2}Z" fill="{c}" {OL.replace("7", "5")}/>'
            f'<path d="M{x} {y - h}L{x + w / 2} {y - h * 0.18}H{x}Z" fill="{d}" opacity=".35"/>')

def bike(x, y, s, rot, rider=True):
    # rower szosowy (wspolrzedne lokalne: tylna os w 0,0)
    p = []
    wheel = lambda cx: (f'<circle cx="{cx}" cy="0" r="44" fill="none" stroke="{INK}" stroke-width="9"/>'
                        f'<circle cx="{cx}" cy="0" r="30" fill="none" stroke="#9AA3B2" stroke-width="2.5"/><circle cx="{cx}" cy="0" r="5" fill="{INK}"/>')
    p.append(wheel(0)); p.append(wheel(150))
    fr = 'stroke="#E30613" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"'
    p.append(f'<path d="M0 0L64 6L50 -72L128 -66L64 6M0 0L50 -72M128 -66L150 0" {fr}/>')
    p.append(f'<path d="M126 -72l2 -10" stroke="{INK}" stroke-width="8" stroke-linecap="round"/>')
    p.append(f'<path d="M126 -84h20c10 0 14 8 12 18c-2 9 -8 12 -14 11" fill="none" stroke="{INK}" stroke-width="7" stroke-linecap="round"/>')
    p.append(f'<path d="M50 -72l-3 -10M34 -86h28" stroke="{INK}" stroke-width="8" stroke-linecap="round"/>')
    p.append(f'<circle cx="64" cy="6" r="12" fill="none" stroke="{INK}" stroke-width="5"/>')
    if rider:
        # noga tylna, cialo, noga przednia, rece, glowa w kasku
        p.append(f'<path d="M48 -92L74 -44L52 22" fill="none" stroke="#2B3242" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>')
        p.append(f'<path d="M52 22h-14" stroke="{INK}" stroke-width="7" stroke-linecap="round"/>')
        p.append(f'<path d="M44 -96C66 -128 98 -138 122 -128" fill="none" stroke="{INK}" stroke-width="34" stroke-linecap="round"/>')
        p.append(f'<path d="M44 -96C66 -128 98 -138 122 -128" fill="none" stroke="#E30613" stroke-width="22" stroke-linecap="round"/>')
        p.append(f'<path d="M62 -116C80 -128 98 -132 114 -128" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>')
        p.append(f'<path d="M44 -94L92 -52L80 -6" fill="none" stroke="{INK}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>')
        p.append(f'<path d="M44 -94L92 -52L80 -6" fill="none" stroke="#2B3242" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>')
        p.append(f'<path d="M80 -6h16" stroke="{INK}" stroke-width="8" stroke-linecap="round"/>')
        p.append(f'<path d="M116 -126L150 -82" fill="none" stroke="{INK}" stroke-width="16" stroke-linecap="round"/>')
        p.append(f'<path d="M116 -126L150 -82" fill="none" stroke="#F2C29B" stroke-width="8" stroke-linecap="round"/>')
        p.append(f'<circle cx="138" cy="-146" r="17" fill="#F2C29B" {OL.replace("7", "6")}/>')
        p.append(f'<path d="M118 -150c2 -18 18 -28 34 -22c10 4 14 12 13 20z" fill="#fff" {OL.replace("7", "6")}/>')
        p.append(f'<path d="M126 -160c8 -8 20 -10 30 -4" fill="none" stroke="#E30613" stroke-width="6" stroke-linecap="round"/>')
        p.append(f'<circle cx="147" cy="-146" r="3" fill="{INK}"/>')
    return f'<g transform="translate({x} {y}) rotate({rot}) scale({s})">{"".join(p)}</g>'

def scene1():
    # rowerzysta szosowy pod gore: niebo, slonce, gory, las, droga
    return f'''<defs>{sky('sk1', '#3FA9F5', '#BDE7FF')}<clipPath id="in1"><circle cx="500" cy="500" r="318"/></clipPath></defs>
<g clip-path="url(#in1)">
<rect x="150" y="150" width="700" height="700" fill="url(#sk1)"/>
{sun(640, 300, 46)}
{cloud(360, 300, 0.9)}
<path d="M150 560L300 400L390 480L500 360L620 470L700 410L860 540V860H150Z" fill="#7FB7D9" {OL}/>
<path d="M455 402L500 360L548 405L522 420L500 400L478 418Z" fill="#fff" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>
<path d="M150 610Q300 520 420 570T700 540T860 560V860H150Z" fill="#3DAE5B" {OL}/>
{''.join(pine(x, y, h) for x, y, h in [(205, 625, 90), (250, 605, 110), (300, 592, 85), (640, 560, 95), (690, 552, 115), (745, 560, 90), (790, 575, 100)])}
<path d="M150 760Q420 720 560 640T860 560V860H150Z" fill="#62C46F" {OL}/>
<path d="M210 860Q330 760 520 690T860 590V640Q620 700 520 760T340 860Z" fill="#8A93A3" {OL}/>
<path d="M300 822Q420 742 540 702M600 676Q700 640 800 618" fill="none" stroke="#fff" stroke-width="7" stroke-dasharray="30 26" stroke-linecap="round"/>
{bike(445, 700, 1.05, -19)}
</g>
<circle cx="500" cy="500" r="318" fill="none" stroke="{INK}" stroke-width="10"/>'''

def house(x, y, s):
    return (f'<g transform="translate({x} {y}) scale({s})">'
            f'<path d="M-95 0V-95H95V0Z" fill="#FFF6E5" {OL}/>'
            f'<path d="M-118 -88L0 -175L118 -88Z" fill="#E30613" {OL}/>'
            f'<path d="M50 -150V-190H78V-128" fill="#B23A2B" {OL}/>'
            f'<path d="M-20 0V-58H22V0" fill="#8B5A2B" {OL.replace("7", "6")}/><circle cx="12" cy="-28" r="4" fill="{INK}"/>'
            f'<path d="M-78 -70H-44V-38H-78ZM44 -70H78V-38H44Z" fill="#9FD8FF" {OL.replace("7", "6")}/>'
            f'<path d="M-61 -70V-38M-78 -54H-44M61 -70V-38M44 -54H78" stroke="{INK}" stroke-width="4"/>'
            f'<path d="M-14 -128a14 14 0 0 1 28 0v16h-28z" fill="#9FD8FF" {OL.replace("7", "5")}/>'
            f'</g>')

def scene2():
    # przyjazny obiekt: domek z czerwonym dachem, rower przy plocie, slonce, gory i las (inny kadr niz w logo 1)
    return f'''<defs>{sky('sk2', '#59B7F2', '#D2EEFF')}<clipPath id="in2"><circle cx="500" cy="500" r="318"/></clipPath></defs>
<g clip-path="url(#in2)">
<rect x="150" y="150" width="700" height="700" fill="url(#sk2)"/>
{sun(330, 300, 44)}
{cloud(640, 280, 0.8)}
<path d="M150 470L270 380L360 450L470 330L580 430L690 370L860 480V860H150Z" fill="#86BDE0" {OL}/>
<path d="M430 368L470 330L512 370L490 382L470 364L450 380Z" fill="#fff" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>
<path d="M150 545Q320 490 500 520T860 520V860H150Z" fill="#3DAE5B" {OL}/>
{''.join(pine(x, y, h) for x, y, h in [(190, 560, 100), (240, 540, 80), (760, 532, 105), (810, 542, 85)])}
<path d="M150 630Q460 590 860 620V860H150Z" fill="#62C46F" {OL}/>
{house(565, 600, 1.05)}
<path d="M245 600V558M280 600V558M315 600V558M350 600V558M385 600V558M235 574H395" stroke="#8B5A2B" stroke-width="9" stroke-linecap="round"/>
{bike(262, 596, 0.8, 0, rider=False)}
<path d="M150 640Q500 620 860 640V860H150Z" fill="#8A93A3" {OL}/>
</g>
<circle cx="500" cy="500" r="318" fill="none" stroke="{INK}" stroke-width="10"/>'''

def badge(scene, top, bottom, top_icon=False, banner=None, top_size=96, bot_size=88, condensed=False, dots=True):
    cx = cy = 500
    s = [f'<circle cx="500" cy="500" r="492" fill="{NAVY}"/>',
         f'<circle cx="500" cy="500" r="470" fill="none" stroke="#fff" stroke-width="5"/>',
         f'<circle cx="500" cy="500" r="336" fill="#fff"/>']
    s.append(scene)
    if condensed: use(FONT_C)
    icon = yt_icon(top_size * 0.74) if top_icon else None
    s.append(f'<g fill="#fff">{arc_text(top, top_size, 372, cx, cy, top=True, icon=icon, gap_before=top_size * 0.22)}</g>')
    s.append(f'<g fill="#fff">{arc_text(bottom, bot_size, 432, cx, cy, top=False)}</g>')
    use(FONT)
    # kropki rozdzielajace na bokach
    for a in ((180, 0) if dots else ()):
        x = cx + 410 * math.cos(math.radians(a)); y = cy + 410 * math.sin(math.radians(a))
        s.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="11" fill="{RED}"/>')
    if banner:
        txt, size = banner
        icw, ic = yt_icon(size * 0.78)
        tw = text_w(txt, size, 0.01)
        W = icw + size * 0.3 + tw + 70
        y0 = 728
        s.append(f'<rect x="{500 - W / 2:.1f}" y="{y0 - size * 0.92:.1f}" width="{W:.1f}" height="{size * 1.32:.1f}" rx="10" fill="#fff" {OL.replace("7", "6")}/>')
        x0 = 500 - W / 2 + 35
        s.append(f'<g transform="translate({x0 + icw / 2:.1f} {y0 + 8})">{ic}</g>')
        s.append(f'<g fill="{INK}">{line_text(txt, size, x0 + icw + size * 0.3 + tw / 2, y0 + 8)}</g>')
    return ''.join(s)

def svg(inner, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000" role="img" aria-label="{title}">'
            f'<title>{title}</title>{inner}</svg>\n')

def build(name_variant='VeloSudety'):
    files = {}
    l1 = badge(scene1(), name_variant, 'VisitPoland.eu', top_icon=True, top_size=104, bot_size=96)
    sfx = '' if name_variant == 'VeloSudety' else '-spacja'
    files[f'velo-sudety-logo-1{sfx}.svg'] = svg(l1, f'{name_variant}, VisitPoland.eu')
    if name_variant == 'VeloSudety':
        l2 = badge(scene2(), 'Obiekt przyjazny Rowerzystom', 'Polecany przez VisitPoland.eu i', banner=(name_variant, 64), top_size=80, bot_size=68, condensed=True, dots=False)
        files['velo-sudety-logo-2.svg'] = svg(l2, f'Obiekt przyjazny Rowerzystom, polecany przez VisitPoland.eu i {name_variant}')
    for n, c in files.items():
        open(os.path.join(OUT, n), 'w', encoding='utf-8').write(c)
    return list(files)

if __name__ == '__main__':
    print(build('VeloSudety') + build('Velo Sudety'))
