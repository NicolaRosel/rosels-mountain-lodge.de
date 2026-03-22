[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$root = "C:\Users\acer\Desktop\Claude Spielplatz\RML Neu"
New-Item -ItemType Directory -Force -Path "$root\assets\fonts\google" | Out-Null
New-Item -ItemType Directory -Force -Path "$root\assets\webfonts" | Out-Null

$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# ── Google Fonts ──────────────────────────────────────────────────────
Write-Host "Lade Google Fonts CSS..." -ForegroundColor Cyan
$googleUrl = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@200;300;400;500&family=Great+Vibes&display=swap"
$css = (Invoke-WebRequest -Uri $googleUrl -Headers @{"User-Agent"=$ua} -UseBasicParsing).Content
Write-Host "CSS geladen ($($css.Length) Zeichen)" -ForegroundColor Green

$urls = [regex]::Matches($css, 'url\((https://fonts\.gstatic\.com/[^\)]+)\)') |
        ForEach-Object { $_.Groups[1].Value } |
        Select-Object -Unique

Write-Host "Gefundene Font-URLs: $($urls.Count)" -ForegroundColor Green

foreach ($url in $urls) {
    $filename = $url.Split('/')[-1]
    Write-Host "  -> $filename"
    Invoke-WebRequest -Uri $url -OutFile "$root\assets\fonts\google\$filename" -Headers @{"User-Agent"=$ua} -UseBasicParsing
    $css = $css -replace [regex]::Escape($url), "../fonts/google/$filename"
}

$css | Set-Content "$root\assets\css\fonts.css" -Encoding UTF8
Write-Host "fonts.css gespeichert." -ForegroundColor Green

# ── Font Awesome ──────────────────────────────────────────────────────
Write-Host "`nLade Font Awesome CSS..." -ForegroundColor Cyan
$faCssUrl = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
$faCss = (Invoke-WebRequest -Uri $faCssUrl -Headers @{"User-Agent"=$ua} -UseBasicParsing).Content

# Webfont-Dateien ermitteln
$faUrls = [regex]::Matches($faCss, 'url\(\.\./webfonts/([^\)]+\.woff2)\)') |
          ForEach-Object { $_.Groups[1].Value } |
          Select-Object -Unique

Write-Host "Font Awesome Webfonts gefunden: $($faUrls.Count)" -ForegroundColor Green

foreach ($filename in $faUrls) {
    $url = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/$filename"
    Write-Host "  -> $filename"
    Invoke-WebRequest -Uri $url -OutFile "$root\assets\webfonts\$filename" -Headers @{"User-Agent"=$ua} -UseBasicParsing
}

# CSS unveraendert speichern (relative Pfade ../webfonts/ stimmen bereits)
$faCss | Set-Content "$root\assets\css\fontawesome.min.css" -Encoding UTF8
Write-Host "fontawesome.min.css gespeichert." -ForegroundColor Green

Write-Host "`nFertig! Alle Dateien wurden heruntergeladen." -ForegroundColor Yellow
