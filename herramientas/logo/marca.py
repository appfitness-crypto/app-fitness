"""Marca: hexágono de puntos (retícula triangular, columnas verticales) con tres chevrones que suben."""
import math, json, sys
R=6                      # anillos del hexágono
S=1.0                    # separación entre puntos
T=math.tan(math.radians(30))
pts=[]
for q in range(-R,R+1):
    for r in range(-R,R+1):
        s=-q-r
        if max(abs(q),abs(r),abs(s))>R: continue
        # columnas verticales: x por columna, y escalonado
        x=S*math.sqrt(3)/2*q
        y=S*(r+q/2)
        pts.append((x,y))
# chevrones ^: en esta retícula v = y - |x|·tan30 da enteros (r o r+q); cada chevrón son dos filas de v
def v(q,r): return r if q>=0 else r+q
CH={'c1':(2,3),'c2':(-1,0),'c3':(-4,-3)}   # abajo, en medio, arriba (y crece hacia abajo)
out=[]
for q in range(-R,R+1):
    for r in range(-R,R+1):
        s=-q-r
        if max(abs(q),abs(r),abs(s))>R: continue
        x=S*math.sqrt(3)/2*q; y=S*(r+q/2); t='base'
        if abs(q)<=4:
            for n,(a,b2) in CH.items():
                if v(q,r) in (a,b2): t=n
        out.append({'x':round(x,4),'y':round(y,4),'t':t})
top=min((p for p in out if p['t']=='c3'),key=lambda p:p['y']); top['t']='cima'
json.dump(out,open('marca.json','w'))
print(len(out),'puntos',{k:sum(1 for p in out if p['t']==k) for k in ['base','c1','c2','c3','cima']})
