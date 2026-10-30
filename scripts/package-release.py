#!/usr/bin/env python3
"""Package final public audio without changing a byte; output only to QA_OUTPUT."""
import hashlib
import json
import os
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
output = Path(os.environ['QA_OUTPUT'])
guide = json.loads((root / 'public/data/guide.json').read_text())
manifest = json.loads((root / 'public/data/audio-manifest.json').read_text())
assert manifest['complete'] and len(manifest['tracks']) == 13
assert sorted(track['id'] for track in manifest['tracks']) == list(range(1, 14))
texts = ['ВАЛЛЕТТА · ГОРОД ЗА КАМНЕМ', 'Русский аудиогид · 30 октября 2026', '',
         'Слушайте файлы по номеру; авторский маршрут и карты находятся в PDF.',
         'Треки можно слушать отдельно в любом MP3-проигрывателе.', '',
         f"Голос: {manifest['voiceName']} · ElevenLabs · {manifest['model']}.",
         'Использован существующий сгенерированный голос; новый голос для этого гида не создавался.', '', 'Остановки:']
for stop in guide['stops']:
    texts.append(f"{stop['id']:02}. {stop['title']}")
texts.extend(['', 'Источники, фотографии и текущая практика: https://github.com/dahura/valletta-nocturne',
              'Опубликованные часы и цены не гарантируют отсутствие разовых закрытий.', ''])
archive = output / 'valletta-audio-ru.zip'
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_STORED) as package:
    for track in manifest['tracks']:
        path = root / 'public' / track['src'].lstrip('/')
        data = path.read_bytes()
        assert hashlib.sha256(data).hexdigest() == track['audioSha256']
        package.writestr(path.name, data)
    package.writestr('README.txt', '\n'.join(texts).encode('utf-8'))
with zipfile.ZipFile(archive) as package:
    assert len([name for name in package.namelist() if name.endswith('.mp3')]) == 13
    assert package.testzip() is None
result = {'archive': str(archive), 'bytes': archive.stat().st_size,
          'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(), 'tracks': 13,
          'pdf': str(root / 'public/downloads/valletta-audioguide-ru.pdf')}
(output / 'release-package.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(result, ensure_ascii=False))
