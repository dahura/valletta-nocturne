#!/usr/bin/env python3
"""Create the fixed 90 × 160 mm author route, entirely from local assets.

Use: lexar.py qa valletta-nocturne pdf -- uv run --with reportlab --with pypdf python scripts/build-pocket-pdf.py
"""
import json, os, re, shutil
from html import escape
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]; QA=Path(os.environ['QA_OUTPUT'])
G=json.loads((ROOT/'public/data/guide.json').read_text()); C=json.loads((ROOT/'public/images/credits.json').read_text())
W,H=90*mm,160*mm; M=5*mm; CW=W-2*M
INK=HexColor('#18343e'); MUTED=HexColor('#5b625f'); ACCENT=HexColor('#8d2748'); PAPER=HexColor('#fbf7ee')
pdfmetrics.registerFont(TTFont('Guide','/System/Library/Fonts/Supplemental/Arial.ttf'))
pdfmetrics.registerFont(TTFont('GuideBold','/System/Library/Fonts/Supplemental/Arial Bold.ttf'))
pdfmetrics.registerFontFamily('Guide',normal='Guide',bold='GuideBold',italic='Guide',boldItalic='GuideBold')
STYLES={
 'body':ParagraphStyle('body',fontName='Guide',fontSize=11.5,leading=12.9,textColor=INK,spaceAfter=4),
 'small':ParagraphStyle('small',fontName='Guide',fontSize=9,leading=10.6,textColor=MUTED),
 'credit':ParagraphStyle('credit',fontName='Guide',fontSize=7.2,leading=8.4,textColor=MUTED),
 'title':ParagraphStyle('title',fontName='GuideBold',fontSize=16.5,leading=17.5,textColor=INK),
 'heading':ParagraphStyle('heading',fontName='GuideBold',fontSize=13,leading=15,textColor=INK),
 'cover':ParagraphStyle('cover',fontName='GuideBold',fontSize=22,leading=23,textColor=INK),
}
PDF=QA/'valletta-audioguide-ru.pdf'; cv=canvas.Canvas(str(PDF),pagesize=(W,H),pageCompression=1)
cv.setTitle('Валлетта. Камень и тишина — Авторский маршрут')
cv.setAuthor('Valletta Nocturne · original Russian guide; photo authors credited individually')
cv.setSubject('Fixed author walking route for two, 30 October 2026, Valletta; 90 x 160 mm')
pages=[]; current={}

def txt(s):return escape(re.sub('[–—‑−]','-',str(s)))
def para(s,style='body',width=CW,raw=False):return Paragraph(s if raw else txt(s),STYLES[style])
def height(p,width=CW):return p.wrap(width,H)[1]
def draw(s,y,style='body',x=M,width=CW,raw=False):
    p=para(s,style,width,raw);ph=height(p,width);p.drawOn(cv,x,y-ph);return y-ph
def link(label,url):return f'<link href="{escape(url,quote=True)}" color="#8d2748">{txt(label)}</link>'
def begin(kind,title=None,stop=None):
    global current
    cv.setFillColor(PAPER);cv.rect(0,0,W,H,fill=1,stroke=0)
    cv.setFillColor(MUTED);cv.setFont('Guide',6.8);cv.drawString(M,H-M-2,'ВАЛЛЕТТА / АВТОРСКИЙ МАРШРУТ')
    cv.setStrokeColor(ACCENT);cv.setLineWidth(.65);cv.line(M,H-M-7,W-M,H-M-7)
    current=dict(page=len(pages)+1,kind=kind,stop=stop,title=title)
    return H-M-15
def end(y):
    if y<M+7:raise ValueError(f'Clipped page {len(pages)+1}: bottom {y:.1f} pt')
    current['contentBottomPt']=round(y,2);pages.append(current)
    cv.setFont('Guide',7);cv.setFillColor(MUTED);cv.drawString(M,5*mm,'30.10.2026 · фиксированная петля');cv.drawRightString(W-M,5*mm,str(len(pages)))
    cv.showPage()
def image_box(path,y,maxh,width=CW):
    pic=Image.open(path); iw,ih=pic.size; scale=min(width/iw,maxh/ih);dw,dh=iw*scale,ih*scale
    # Passing the filename preserves JPEG DCT compression instead of embedding raw RGB.
    cv.drawImage(str(path),M+(width-dw)/2,y-dh,width=dw,height=dh,mask='auto');return y-dh
def source_for_stop(s):
    return ' · '.join(link(x['label'].split(':')[0],x['url']) for x in s['sources'][:2])

# The maps come first, with no remote image dependencies.
y=begin('overview','Авторский маршрут');y=draw('Валлетта.\nКамень и тишина'.replace('\n','<br/>'),y,'cover',raw=True)-5
y=draw('Авторский маршрут для двоих',y,'heading')-4
y=draw('Пятница, 30 октября 2026 · 13 точек<br/>'+txt(G['distance']),y,'small',raw=True)-7
y=image_box(ROOT/'public/maps/route-overview.png',y,75*mm)-6
y=draw('3-4 часа; собор сокращённо или форт. Начало и конец у City Gate; автобусный терминал за воротами.',y)-5
y=draw('Линия идёт по улицам. Стрелки показывают ход; номера закреплены за местами. Внутренние дворы и закрытые территории не являются проходом.',y,'small')-3
y=draw(link('© OpenStreetMap contributors','https://www.openstreetmap.org/copyright')+' · карта из геометрии OSM, 30.10.2026',y,'credit',raw=True);end(y)

y=begin('map-west','Западная часть');y=draw('Западная часть',y,'title')-7
y=image_box(ROOT/'public/maps/route-west.png',y,108*mm)-7
y=draw('Точки 1-10: от ворот через Верхнюю Барракку, собор и главные улицы к театру Маноэль.',y,'body')-5
y=draw('Имена улиц на карте даны по-английски. На местных табличках Triq означает «улица», Misraħ — «площадь».',y,'small')-4
y=draw(link('© OpenStreetMap contributors','https://www.openstreetmap.org/copyright'),y,'credit',raw=True);end(y)

y=begin('map-east','Восточная часть');y=draw('Восточная часть',y,'title')-7
y=image_box(ROOT/'public/maps/route-east.png',y,81*mm)-7
for n in (11,12,13):y=draw(f"{n}. {G['stops'][n-1]['title']}",y,'body')-3
y=draw('Возврат: St Ursula Street → St John Street → Republic Street → City Gate. Около 20 минут до терминала. Закрытую калитку не обходите через ограждение.',y,'small')-5
y=draw(link('© OpenStreetMap contributors','https://www.openstreetmap.org/copyright'),y,'credit',raw=True);end(y)

y=begin('route-index','Как идти');y=draw('Как идти вдвоём',y,'title')-7
for s in G['stops']:y=draw(f"{s['id']:02d}. {s['title']}",y,'body')-3
y-=5;y=draw('Один интерьер: сокращённый осмотр собора с Караваджо или Fort St Elmo. Остальные места смотрим с улицы. Три музея в эту петлю не входят.',y,'body')-5
y=draw('Госпитальеры — рыцари ордена Святого Иоанна. Подтверждённых рассказов о привидениях для этих точек не найдено; атмосферные сравнения в текстах — авторские впечатления.',y,'small');end(y)

NEXT=[
 'Republic Street → руины оперы.',
 'South Street → Castille Place.',
 'Основной вход в Upper Barrakka.',
 'Castille Place → Merchant Street → St John Street.',
 'По St John Street к собору.',
 'Republic Street → Republic Square.',
 'Republic Street → St George’s Square.',
 'Archbishop Street → Strait Street → St Christopher Street.',
 'На запад по Strait Street → Old Theatre Street → театр.',
 'По линии карты к Republic Street → Hospital Street → Mediterranean Street и входу в форт.',
 'По Mediterranean Street к MCC.',
 'По Mediterranean Street к Lower Barrakka.',
 'St Ursula Street → St John Street → Republic Street → City Gate → терминал (около 20 минут).',
]

ABRIDGE={
1:[('what','Начните рассказ после перехода через мост, отойдя от потока людей.')],
2:[('what','Посмотрите на неё с общественной улицы: вход на площадку зависит от событий и работы театра.')],
3:[('what','Наша остановка находится снаружи, на площади.')],
4:[('look','Пройдите к аркаде и найдите на противоположном берегу линии укреплений.'),('look','Понаблюдайте, как корабли кажутся маленькими под стенами.')],
5:[('look','Для двоих это хорошее место замедлиться: один замечает детали наверху, другой следит за движением и ступенями.')],
6:[('what','при очереди дневная петля займёт больше времени.'),('look','Соблюдайте правила храма и не задерживайтесь на узких проходах.')],
7:[('look','Выпейте воды, проверьте время и решите, нужен ли вам кофе до продолжения пути.')],
8:[('look','Взгляните на длинные балконы и ритм окон: они словно следят за площадью.'),('look','Это художественный образ, а не рассказ о привидениях.'),('look','Сравните сдержанный фасад с пышностью, которую обещает само слово «дворец».')],
9:[('what','Днём особенно заметны её глубина, старые вывески и двери, отделённые от вас полосой прохладной тени.'),('look','Посмотрите на расстояние между противоположными фасадами.')],
10:[('look','Закройте на мгновение глаза: за этой дверью столетиями менялись языки и голоса актёров.'),('look','Мы не приписываем им призрачное возвращение.')],
11:[('what','Для уличной версии достаточно осмотреть укрепления с разрешённого подхода к входу.'),('look','Полноценные посещения обоих мест удлинят прогулку.')],
12:[('look','Нынешние конференции продолжают очень старую привычку этого места собирать людей под одной крышей.')],
13:[('look','Пусть завершением будет вид на воду и минута тишины для двоих.')],
}
for s,credit in zip(G['stops'],C):
    y=begin('stop',s['title'],s['id'])
    title=para(f"{s['id']:02d}. {s['title']}",'title');subtitle=para('','small')
    sections=dict(s['sections'])
    for field,sentence in ABRIDGE.get(s['id'],[]):sections[field]=sections[field].replace(sentence,'').strip().replace('  ',' ')
    sections['what']=sections['what'].replace('около часа;','около часа.')
    body=[para(f"<b>{label}.</b> {txt(sections[key])}",raw=True) for key,label in [('what','Что это'),('history','История'),('look','На что смотреть')]]
    credits=para(f"Фото: {txt(s['image']['author'])} · {txt(s['image']['license'])} · {link('Commons',s['image']['sourceUrl'])}",'credit',raw=True)
    direction=para('<b>Дальше:</b> '+txt(NEXT[s['id']-1]),'small',raw=True)
    sources=para('Источники: '+source_for_stop(s),'credit',raw=True)
    fixed=height(title)+height(subtitle)+sum(height(p)+4 for p in body)+height(credits)+height(direction)+height(sources)+30
    photo_h=min(26*mm,y-(M+10)-fixed)
    if photo_h<10*mm:raise ValueError(f"Stop {s['id']} won't fit at 11.5 pt; photo {photo_h/mm:.1f} mm")
    title.drawOn(cv,M,y-height(title));y-=height(title)+3
    y-=3
    y=image_box(ROOT/'public'/s['image']['src'].lstrip('/'),y,photo_h)-3
    credits.drawOn(cv,M,y-height(credits));y-=height(credits)+7
    for p in body:p.drawOn(cv,M,y-height(p));y-=height(p)+4
    cv.setStrokeColor(HexColor('#d5cab9'));cv.line(M,y-1,W-M,y-1);y-=7
    direction.drawOn(cv,M,y-height(direction));y-=height(direction)+4
    sources.drawOn(cv,M,y-height(sources));y-=height(sources)
    current['bodyFontPt']=11.5;current['photoMaxHeightMm']=round(photo_h/mm,1);end(y)

PRACTICAL=[('Входы и часы',[
 ('Собор', 'Пн-сб 09:00-16:45, последний вход 16:00. Взрослый €15, двое €30. Русский аудиогид включён. Музей закрыт на расширение и ремонт. Это не подтверждение закрытия собора и оратория с Караваджо; доступ уточняйте отдельно.', 'https://www.stjohnscocathedral.com/visit/'),
 ('Fort St Elmo', 'До 31.10.2026 ежедневно 09:00-19:00, последний вход 18:30. Взрослый €10, двое €20. Зал Первой мировой войны, секция 4, закрыт. Осмотр около 90 минут.', 'https://heritagemalta.mt/explore/fort-st-elmo-national-war-museum/'),
 ('Дворец', 'До 31.10.2026 ежедневно 10:00-18:00, последний вход 17:30. Взрослый €12, двое €24. Тронный зал закрыт; возможны государственные мероприятия.', 'https://heritagemalta.mt/explore/grand-masters-palace/'),
 ('Маноэль', 'Зимние экскурсии пн-пт в 11:00 и 15:00, €10 с человека. Театр предупреждает об отменах из-за репетиций.', 'https://teatrumanoel.mt/visit/'),
]),('Кофе и автобусы',[
 ('Caffè Cordina', '244 Republic Street. По официальному сайту пн-сб 07:30-23:00, вс 07:30-17:00. Цены заказа и свободный столик проверьте на месте.', 'https://caffecordina.com.mt/contact/'),
 ('Is-Suq tal-Belt', 'Merchant Street: Food Court ежедневно 11:00-22:00; магазин на уровне −1 — 07:00-21:00. Возможны сезонные изменения. Цены зависят от выбранной точки.', 'https://issuqtalbelt.com/'),
 ('Возврат на 41/42', 'На опубликованных страницах — Valletta B6, направление Ċirkewwa. Проверьте табло и рейс до своей остановки в Tallinja; у маршрутов разные остановки.', 'https://www.publictransport.com.mt/route/42/'),
 ('Билет', 'Зимний тариф 18.10.2026-12.06.2027: €2 с человека на дневные маршруты, 2 часа действия. Наличные или бесконтактно. После прогулки нужен новый действующий билет.', 'https://www.publictransport.com.mt/rates-offers-local/'),
]),('Паузы и доступ',[
 ('Saluting Battery', 'Пн-сб 09:30-17:30, последний вход 17:00. Билет €3 с человека. Опубликованы выстрелы в 12:00 и 16:00; приходите за 15 минут. Залп необязателен для маршрута.', 'https://www.salutingbattery.com/'),
 ('Колокол осады', 'Мемориал Второй мировой войны, 1992 год. Heritage Malta в 2025 году сообщила об остановленном звоне и реставрации. Возобновление звона и доступ к мемориалу не подтверждены.', 'https://heritagemalta.mt/news/heritage-malta-entering-new-phase-of-siege-bell-memorial-restoration-with-support-from-the-malta-airport-foundation/'),
 ('Сады и улицы', 'Точные часы калиток и разовый доступ 30 октября не подтверждены. При закрытии оставайтесь на разрешённых улицах. Маршрут включает уклоны и ступени.', 'https://ambjentmalta.gov.mt/what-we-do/managed-sites/lower-barrakka/'),
 ('Бюджет времени', 'Ходьба 70-90 минут, остановки 35-45, кофе и запас 20-30. Собор: сокращённый авторский осмотр 55-70 минут; официальный ориентир 1 час 45 минут. Полный добавит 35-50 минут к петле 3-4 часа. Форт вместо собора: около 90 минут.', None),
])]

all_items={label:(label,text,url) for _,items in PRACTICAL for label,text,url in items}
PRACTICAL=[(title,[all_items[label] for label in labels]) for title,labels in [
 ('Входы и часы',['Собор','Fort St Elmo','Дворец']),
 ('Театр, залп, колокол',['Маноэль','Saluting Battery','Колокол осады']),
 ('Кофе и сады',['Caffè Cordina','Is-Suq tal-Belt','Сады и улицы']),
 ('Автобусы и темп',['Возврат на 41/42','Билет','Бюджет времени']),
]]
for title,items in PRACTICAL:
    y=begin('practical',title);y=draw(title,y,'title')-7
    y=draw('Проверено 30.10.2026. Опубликованное расписание не гарантирует отсутствие разового закрытия именно в этот день.',y,'small')-8
    for label,text,url in items:
        y=draw(label,y,'heading')-3;y=draw(text,y)-3
        if url:y=draw(link('Официальный источник',url),y,'credit',raw=True)-6
    end(y)

# Full readable authors, licence links and source cards are included in the PDF.
for start in range(0,13,5):
    y=begin('credits','Фото и лицензии');y=draw('Фото и лицензии',y,'title')-7
    for s,c in zip(G['stops'][start:start+5],C[start:start+5]):
        y=draw(f"{s['id']:02d}. {s['title']}",y,'heading')-2
        y=draw(f"{s['image']['author']} · {s['image']['license']}",y)-2
        links=link('Карточка Wikimedia Commons',s['image']['sourceUrl'])
        if c.get('licenseUrl'):links+=' · '+link('Лицензия',c['licenseUrl'])
        y=draw(links,y,'small',raw=True)-8
    y=draw('Фотографии уменьшены до JPEG; без генеративных изменений. Карты построены из данных OpenStreetMap, ODbL. Геометрия маршрута: пешеходный профиль FOSSGIS/OSRM; время оценочное.',y,'small')-4
    y=draw(link('© OpenStreetMap contributors','https://www.openstreetmap.org/copyright')+' · '+link('OSRM foot','https://routing.openstreetmap.de/'),y,'credit',raw=True);end(y)

cv.save()
reader=PdfReader(str(PDF))
assert len(reader.pages)==len(pages)
assert [p['stop'] for p in pages if p['kind']=='stop']==list(range(1,14))
for p in reader.pages:
    assert abs(float(p.mediabox.width)-W)<.1 and abs(float(p.mediabox.height)-H)<.1
final=ROOT/'public/downloads/valletta-audioguide-ru.pdf';final.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(PDF,final)
evidence=dict(pages=len(pages),pageSizeMm=[90,160],stopPages=13,bodyFontPt=11.5,bytes=PDF.stat().st_size,output=str(final),pageDetails=pages)
(QA/'pdf-layout-evidence.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(evidence,ensure_ascii=False,indent=2))
