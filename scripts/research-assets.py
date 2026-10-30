#!/usr/bin/env python3
"""Wikimedia licensing, OSM foot routing and bounded cached map tile rendering.

Run using lexar.py qa; QA_OUTPUT is mandatory for intermediate downloads.
The only published outputs are licensed photos, attribution, route and maps.
"""
import argparse, html, json, math, os, re, time, xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import quote
import requests
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT=Path(__file__).resolve().parents[1]
CACHE=Path(os.environ['QA_OUTPUT'])
GUIDE=ROOT/'public/data/guide.json'
UA='VallettaNocturne/1.0 (small offline walking guide; Wikimedia and OpenStreetMap attribution retained)'
SESSION=requests.Session(); SESSION.headers['User-Agent']=UA
def get(url,params=None):
    for attempt in range(3):
        r=SESSION.get(url,params=params,timeout=55)
        if r.status_code in (429,503) and attempt<2:
            time.sleep(min(12,max(4,int(r.headers.get('Retry-After','5')))));continue
        r.raise_for_status()
        if 'w/api.php' in url:time.sleep(1.3)
        return r
def clean(s):return html.unescape(re.sub('<[^>]+>','',s or '')).strip()
def write(path,obj):path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def guide():return json.loads(GUIDE.read_text())

WIKI_TITLES=['City Gate (Valletta)','Royal Opera House, Valletta','Auberge de Castille','Upper Barrakka Gardens','Merchant Street, Valletta',"St John’s Co-Cathedral",'Republic Street, Valletta',"Grandmaster's Palace, Valletta",'Strait Street','Manoel Theatre','Fort Saint Elmo','Mediterranean Conference Centre','Lower Barrakka Gardens']
SEARCHES=['Valletta City Gate Renzo Piano','Pjazza Teatru Rjal','Auberge de Castille facade','Upper Barrakka Gardens','Merchant Street Valletta','St John Co Cathedral Valletta facade','Republic Street Valletta','Grandmaster Palace Valletta facade','Strait Street Valletta','Manoel Theatre interior','Fort Saint Elmo Valletta','Sacra Infermeria Valletta','Lower Barrakka Gardens Valletta']
def candidates(resume=None):
    result=json.loads(Path(resume).read_text()) if resume else []
    for s,title,q in zip(guide()['stops'],WIKI_TITLES,SEARCHES):
        if any(x['id']==s['id'] for x in result):continue
        wiki=get('https://en.wikipedia.org/w/api.php',{'action':'query','format':'json','titles':title.replace('’',"'"),'prop':'pageimages','piprop':'name|original'}).json()
        candidates=[]
        for p in wiki.get('query',{}).get('pages',{}).values():
            if p.get('pageimage'):candidates.append('File:'+p['pageimage'])
        if not candidates:
            search=get('https://commons.wikimedia.org/w/api.php',{'action':'query','format':'json','list':'search','srnamespace':6,'srsearch':q,'srlimit':4}).json()
            candidates += [p['title'] for p in search.get('query',{}).get('search',[])]
        candidates=list(dict.fromkeys(candidates))
        info=get('https://commons.wikimedia.org/w/api.php',{'action':'query','format':'json','titles':'|'.join(candidates),'prop':'imageinfo','iiprop':'url|extmetadata|size|mime','iiurlwidth':1200}).json()
        pages=info.get('query',{}).get('pages',{})
        entries=[]
        for name in candidates:
            for p in pages.values():
                if p.get('title','').replace('_',' ')!=name.replace('_',' ') or not p.get('imageinfo'):continue
                im=p['imageinfo'][0];m=im.get('extmetadata',{});lic=clean(m.get('LicenseShortName',{}).get('value',''))
                if not (lic.startswith(('CC BY','CC0','Public domain')) or lic=='PD'):continue
                if im.get('mime') not in ('image/jpeg','image/png') or im.get('width',0)<600:continue
                entries.append(dict(title=name,url=im.get('thumburl',im['url']),original=im['url'],sourceUrl=im['descriptionurl'],author=clean(m.get('Artist',{}).get('value','')),license=lic,licenseUrl=m.get('LicenseUrl',{}).get('value',''),description=clean(m.get('ImageDescription',{}).get('value','')),width=im['width'],height=im['height']))
        result.append(dict(id=s['id'],slug=s['slug'],candidates=entries))
        write(CACHE/'media-candidates.json',result)
        print(s['id'],s['slug'],[(x['title'],x['license']) for x in entries],flush=True)
        time.sleep(.15)
    print('CANDIDATES',CACHE/'media-candidates.json',flush=True)

def download(candidate_path):
    g=guide();data=sorted(json.loads(Path(candidate_path).read_text()),key=lambda r:r['id']); thumbs=[];credits=[]
    for s,row in zip(g['stops'],data):
        if not row['candidates']:raise ValueError('No licensed image for '+s['slug'])
        im=row['candidates'][row.get('chosen',0)]
        local=CACHE/f"{s['id']:02d}-{s['slug']}-source.jpg"
        if not local.exists():local.write_bytes(get(im['url']).content)
        picture=Image.open(local).convert('RGB'); picture.thumbnail((1200,1200))
        dst=ROOT/'public/images'/f"{s['id']:02d}-{s['slug']}.jpg";dst.parent.mkdir(parents=True,exist_ok=True);picture.save(dst,quality=88,optimize=True)
        s['image']=dict(src='/images/'+dst.name,alt=s['title']+' — фотография места',author=im['author'],license=im['license'],sourceUrl=im['sourceUrl'])
        credits.append(dict(id=s['id'],title=im['title'],**s['image'],licenseUrl=im['licenseUrl'],originalUrl=im['original'],adaptation='Resized JPEG, colour retained; full subject shown without generative edits.'))
        tile=Image.new('RGB',(360,280),'#f3eee2');fit=ImageOps.contain(picture,(360,235));tile.paste(fit,((360-fit.width)//2,0));d=ImageDraw.Draw(tile);d.text((8,240),f"{s['id']:02d} {s['slug']}",fill='#131313');d.text((8,259),im['license'],fill='#131313');thumbs.append(tile)
        print('PHOTO',s['id'],im['title'],im['license'],flush=True)
        write(GUIDE,g);write(ROOT/'public/images/credits.json',credits)
        time.sleep(.15)
    sheet=Image.new('RGB',(360*3,280*math.ceil(len(thumbs)/3)),'white')
    for n,t in enumerate(thumbs):sheet.paste(t,((n%3)*360,(n//3)*280))
    sheet.save(CACHE/'photo-contact-sheet.jpg'); print('SHEET',CACHE/'photo-contact-sheet.jpg')

def route():
    g=guide();stops=g['stops'];points=[(s['lng'],s['lat']) for s in stops]+[(stops[0]['lng'],stops[0]['lat'])]
    coords=';'.join(f'{lng:.6f},{lat:.6f}' for lng,lat in points)
    url='https://routing.openstreetmap.de/routed-foot/route/v1/foot/'+coords
    payload=get(url,{'overview':'full','geometries':'geojson','steps':'true','continue_straight':'false'}).json();write(CACHE/'foot-routing-response.json',payload)
    if payload.get('code')!='Ok':raise ValueError(payload)
    r=payload['routes'][0];features=[]
    for i,leg in enumerate(r['legs']):
        cc=[];names=[]
        for step in leg['steps']:
            a=step['geometry']['coordinates'];cc.extend(a if not cc else a[1:])
            if step.get('name') and (not names or step['name']!=names[-1]):names.append(step['name'])
        features.append(dict(type='Feature',properties=dict(kind='walk',fromStop=i+1,toStop=i+2 if i<12 else 1,distanceMeters=leg['distance'],durationSecondsEstimate=leg['duration'],streets=names,profile='foot',source='FOSSGIS routing.openstreetmap.de/routed-foot',checked='2026-10-30',instructions=stops[i]['nextDirections']),geometry=dict(type='LineString',coordinates=cc)))
        stops[i]['walkMinutes']=max(1,math.ceil(leg['distance']/65))
        print('LEG',i+1,'→',i+2 if i<12 else 1,round(leg['distance']),names,flush=True)
    collection=dict(type='FeatureCollection',properties=dict(distanceMeters=r['distance'],durationSecondsEstimate=r['duration'],profile='foot',checked='2026-10-30',attribution='© OpenStreetMap contributors',attributionUrl='https://www.openstreetmap.org/copyright',routingUrl='https://routing.openstreetmap.de/',note='Street-network foot routing, not a field survey. Times are estimates; stairs, gated gardens, works and event restrictions may require a detour. Return to City Gate included; terminal approach and indoor walking excluded.'),features=features)
    write(ROOT/'public/data/route.geojson',collection)
    g['distance']=f"{r['distance']/1000:.1f} км по уличной сети, включая возврат к City Gate"
    g['routeNotes'][-1]=f"Геометрия: пешеходный профиль FOSSGIS/OSRM на данных OpenStreetMap, получен 30.10.2026; длина {r['distance']/1000:.1f} км с возвратом к воротам. Это расчёт по карте, а не проверка проходимости на месте. Ступени, работы и закрытые ворота могут потребовать обхода; маршрут не заявлен как безбарьерный."
    write(GUIDE,g);print('ROUTE_METERS',r['distance'],'ENGINE_SECONDS',r['duration'])

def merc(lng,lat,z):
    n=2**z;return ((lng+180)/360*n,(1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n)
def font(size,bold=False):
    paths=['/System/Library/Fonts/Supplemental/Arial Bold.ttf' if bold else '/System/Library/Fonts/Supplemental/Arial.ttf','/System/Library/Fonts/Supplemental/Tahoma.ttf']
    for p in paths:
        if Path(p).exists():return ImageFont.truetype(p,size)
    return ImageFont.load_default()
def maps(osm_source):
    """Rasterise actual OSM streets/buildings locally; no third-party tiles needed."""
    if not osm_source:raise ValueError('--osm requires a cached OSM API XML file')
    osm=ET.parse(osm_source).getroot()
    nodes={n.attrib['id']:(float(n.attrib['lon']),float(n.attrib['lat'])) for n in osm.findall('node')}
    ways=[]
    for w in osm.findall('way'):
        tags={t.attrib['k']:t.attrib['v'] for t in w.findall('tag')}
        cc=[nodes[n.attrib['ref']] for n in w.findall('nd') if n.attrib['ref'] in nodes]
        if len(cc)>1:ways.append((tags,cc))
    chains=[cc[:] for tags,cc in ways if tags.get('natural')=='coastline']
    changed=True
    while changed:
        changed=False
        for i,a in enumerate(chains):
            for j,b in enumerate(chains):
                if i!=j and a[-1]==b[0]:
                    chains[i]=a+b[1:];chains.pop(j);changed=True;break
            if changed:break
    g=guide();route=json.loads((ROOT/'public/data/route.geojson').read_text());(ROOT/'public/maps').mkdir(parents=True,exist_ok=True)
    specs=[('route-overview',16,(14.5077,35.8939,14.5200,35.9020),'Авторский маршрут · 13 точек'),('route-west',17,(14.5082,35.8941,14.5160,35.9008),'Запад · точки 1–10'),('route-east',17,(14.5130,35.8967,14.5202,35.9014),'Восток · точки 11–13')]
    labels={'Republic Street':'Republic St','Merchant Street':'Merchant St','Merchants Street':'Merchant St','Strait Street':'Strait St','Old Theatre Street':'Old Theatre St','Saint John Street':'St John St','Saint Ursula Street':'St Ursula St','Saint Christopher Street':'St Christopher St','Mediterranean Street':'Mediterranean St','Castille Place':'Castille Pl','Hospital Street':'Hospital St'}
    for name,z,(west,south,east,north),title in specs:
        x0,y0=merc(west,north,z);x1,y1=merc(east,south,z);scale=2;ww,hh=round((x1-x0)*256*scale),round((y1-y0)*256*scale)
        img=Image.new('RGB',(ww,hh),'#e1eaf0');d=ImageDraw.Draw(img)
        def xy(coord):
            xx,yy=merc(coord[0],coord[1],z);return ((xx-x0)*256*scale,(yy-y0)*256*scale)
        for chain in chains:
            if len(chain)>5:d.polygon([xy(c) for c in chain],fill='#f6f0e4',outline='#aebfc2')
        for tags,cc in ways:
            if tags.get('leisure') in ('park','garden') or tags.get('landuse') in ('grass','forest'):
                d.polygon([xy(c) for c in cc],fill='#dce4ce')
            elif tags.get('building') and cc[0]==cc[-1]:d.polygon([xy(c) for c in cc],fill='#dbd3c5',outline='#cbc1b1')
            elif tags.get('highway') and tags.get('area')=='yes' and cc[0]==cc[-1]:d.polygon([xy(c) for c in cc],fill='#eee7da')
        for tags,cc in ways:
            if tags.get('highway') and tags.get('area')!='yes' and tags['highway'] not in ('construction','proposed','motorway'):
                width=10 if tags['highway'] in ('tertiary','residential','unclassified') else 6
                pts=[xy(c) for c in cc];d.line(pts,fill='#c9c0b2',width=width+3,joint='curve');d.line(pts,fill='#fffdf7',width=width,joint='curve')
        for feature in route['features']:
            pts=[xy(c) for c in feature['geometry']['coordinates']];d.line(pts,fill='#fff8ee',width=14,joint='curve');d.line(pts,fill='#8d2748',width=7,joint='curve')
            # Several direction arrows help distinguish outward and return legs.
            for k in range(max(1,len(pts)//3),len(pts),max(2,len(pts)//3)):
                a,b=pts[k-1],pts[k];dx,dy=b[0]-a[0],b[1]-a[1];ll=math.hypot(dx,dy)
                if ll>0:
                    ux,uy=dx/ll,dy/ll;mx,my=b;d.polygon([(mx+ux*12,my+uy*12),(mx-ux*10-uy*8,my-uy*10+ux*8),(mx-ux*10+uy*8,my-uy*10-ux*8)],fill='#8d2748')
        # Place a single English label for each relevant street, using its real line angle.
        candidates={}
        for tags,cc in ways:
            street=tags.get('name:en','')
            if not tags.get('highway') or tags.get('area')=='yes' or street not in labels:continue
            pts=[xy(c) for c in cc]
            for a,b in zip(pts,pts[1:]):
                mid=((a[0]+b[0])/2,(a[1]+b[1])/2);ll=math.dist(a,b)
                if 65<mid[0]<ww-65 and 65<mid[1]<hh-65 and ll>candidates.get(street,(0,None,None))[0]:candidates[street]=(ll,a,b)
        occupied=[]
        for street,(ll,a,b) in sorted(candidates.items(),key=lambda kv:-kv[1][0]):
            f=font(31 if z==16 else 36,False);txt=labels[street];box=d.textbbox((0,0),txt,font=f);tw,th=box[2]-box[0]+12,box[3]-box[1]+12
            layer=Image.new('RGBA',(tw,th),(255,253,247,225));ld=ImageDraw.Draw(layer);ld.text((6,6-box[1]),txt,font=f,fill='#58615f')
            angle=-math.degrees(math.atan2(b[1]-a[1],b[0]-a[0]));angle=(angle+90)%180-90
            layer=layer.rotate(angle,expand=True,resample=Image.Resampling.BICUBIC);mx,my=(a[0]+b[0])/2,(a[1]+b[1])/2
            rect=(mx-layer.width/2,my-layer.height/2,mx+layer.width/2,my+layer.height/2)
            if any(not(rect[2]<r[0] or rect[0]>r[2] or rect[3]<r[1] or rect[1]>r[3]) for r in occupied):continue
            img.paste(layer,(round(rect[0]),round(rect[1])),layer);occupied.append(rect)
        d=ImageDraw.Draw(img)
        for s in g['stops']:
            if not(west<=s['lng']<=east and south<=s['lat']<=north):continue
            x,y=xy((s['lng'],s['lat']));rad=29 if z==16 else 32;d.ellipse((x-rad,y-rad,x+rad,y+rad),fill='#173640',outline='#fffdf7',width=4);f=font(34 if z==16 else 38,True);txt=str(s['id']);box=d.textbbox((0,0),txt,font=f);d.text((x-(box[2]-box[0])/2,y-(box[3]-box[1])/2-box[1]),txt,font=f,fill='white')
        # North indicator and a measured scale bar.
        d.line((ww-55,100,ww-55,35),fill='#173640',width=5);d.polygon([(ww-55,25),(ww-67,45),(ww-43,45)],fill='#173640');d.text((ww-70,105),'N',font=font(28,True),fill='#173640')
        px100=(100/(math.cos(math.radians((south+north)/2))*2*math.pi*6378137)*(2**z)*256*scale)
        d.line((35,hh-35,35+px100,hh-35),fill='#173640',width=5);d.text((35,hh-76),'100 м',font=font(26),fill='#173640')
        out=Image.new('RGB',(ww,hh+105),'#f6f0e4');out.paste(img,(0,62));od=ImageDraw.Draw(out);od.text((15,14),title,font=font(29,True),fill='#173640');od.text((15,out.height-32),'© OpenStreetMap contributors · openstreetmap.org/copyright',font=font(21),fill='#173640');out.save(ROOT/'public/maps'/f'{name}.png');print('MAP',name,out.size,flush=True)
    write(CACHE/'map-evidence.json',dict(method='Local rasterisation of OSM API street/building/coastline geometry, OSRM foot route. No blocked or API-key placeholder tiles in final maps.',source='https://api.openstreetmap.org/api/0.6/map?bbox=14.507,35.893,14.522,35.904',attribution='© OpenStreetMap contributors',tilesUsedInFinal=0,osmXmlBytes=Path(osm_source).stat().st_size))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('action',choices=['candidates','download','route','maps']);p.add_argument('--candidates');p.add_argument('--osm');a=p.parse_args()
    if a.action=='candidates':candidates(a.candidates)
    elif a.action=='download':download(a.candidates)
    elif a.action=='route':route()
    else:maps(a.osm)
