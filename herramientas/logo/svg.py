import json,sys
P=json.load(open('marca.json'))
modo=sys.argv[1] if len(sys.argv)>1 else 'oscuro'
pal={'oscuro':dict(bg='#0A0E13',base='#2B333C',c1='#4F6418',c2='#8DB02A',c3='#C8F23A',cima='#F1F5F7'),
     'claro':dict(bg='#FFFFFF',base='#D5DCE2',c1='#C9DE85',c2='#9CC22E',c3='#6E9A00',cima='#0A0E13')}[modo]
R={'base':0.13,'c1':0.36,'c2':0.38,'c3':0.40,'cima':0.42}
xs=[p['x'] for p in P]; ys=[p['y'] for p in P]; m=1.2
vb=f"{min(xs)-m:.3f} {min(ys)-m:.3f} {max(xs)-min(xs)+2*m:.3f} {max(ys)-min(ys)+2*m:.3f}"
c=''.join(f'<circle cx="{p["x"]}" cy="{p["y"]}" r="{R[p["t"]]}" fill="{pal[p["t"]]}"/>' for p in P)
fondo=f'<rect x="{min(xs)-m}" y="{min(ys)-m}" width="{max(xs)-min(xs)+2*m}" height="{max(ys)-min(ys)+2*m}" fill="{pal["bg"]}"/>' if len(sys.argv)<3 else ''
open(f'marca-{modo}.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="1024" height="{1024*(max(ys)-min(ys)+2*m)/(max(xs)-min(xs)+2*m):.0f}">{fondo}{c}</svg>')
