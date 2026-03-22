$root = "C:\Users\acer\Desktop\Claude Spielplatz\RML Neu"
$files = @("index.html", "ferienwohnung.html", "impressum.html", "datenschutz.html")

$oldBlock = @"
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@200;300;400;500&family=Great+Vibes&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
"@

$newBlock = @"
  <link rel="stylesheet" href="assets/css/fonts.css" />
  <link rel="stylesheet" href="assets/css/fontawesome.min.css" />
"@

foreach ($file in $files) {
    $path = "$root\$file"
    $content = Get-Content $path -Raw -Encoding UTF8
    if ($content -match [regex]::Escape("fonts.googleapis.com")) {
        $content = $content -replace [regex]::Escape($oldBlock), $newBlock
        $content | Set-Content $path -Encoding UTF8 -NoNewline
        Write-Host "Aktualisiert: $file" -ForegroundColor Green
    } else {
        Write-Host "Bereits aktuell oder nicht gefunden: $file" -ForegroundColor Yellow
    }
}
Write-Host "Fertig." -ForegroundColor Cyan
