Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\Yoga Slim 7 ProX\.gemini\antigravity-ide\brain\69a15420-5782-4823-a006-25f01d4ada14\barbershop_logo_1780278042089.png")

function Resize-Image($img, $w, $h, $path) {
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.DrawImage($img, 0, 0, $w, $h)
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $graph.Dispose()
    $bmp.Dispose()
}

Resize-Image $img 192 192 "d:\POS-Barbershop\public\pwa-192x192.png"
Resize-Image $img 512 512 "d:\POS-Barbershop\public\pwa-512x512.png"
Resize-Image $img 180 180 "d:\POS-Barbershop\public\apple-touch-icon.png"
Resize-Image $img 64 64 "d:\POS-Barbershop\public\favicon.png"

$img.Dispose()
