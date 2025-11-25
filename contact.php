<?php
// Luba CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

// Loeme POST JSON
$input = json_decode(file_get_contents("php://input"), true);

// Kui pole andmeid, katkesta
if (!$input) {
    echo json_encode(["ok" => false, "error" => "No input"]);
    exit;
}

$name = $input["name"] ?? "Anonüümne";
$message = $input["message"] ?? "";

// Kui sõnum tühi, katkesta
if (trim($message) === "") {
    echo json_encode(["ok" => false, "error" => "Empty message"]);
    exit;
}

// -------------------------------
// IP tuvastamine (päris IP!)
// -------------------------------
$ip = $_SERVER["REMOTE_ADDR"] ?? "Unknown IP";

// Cloudflare / proxy tugi
if (!empty($_SERVER["HTTP_X_FORWARDED_FOR"])) {
    $forwarded = explode(",", $_SERVER["HTTP_X_FORWARDED_FOR"]);
    $ip = trim($forwarded[0]);
}

// -------------------------------
// DISCORD WEBHOOK
// -------------------------------
$webhook = "https://discord.com/api/webhooks/1441483174575214703/FFgIjZOIUY_K5YRi-KiUHZ4X3t2H13XsrojSYZIwsoeKg-vAPwu4uKJVsXl3oOhL_f7C";

$content = "**Uus sõnum veebilehelt**\n"
         . "**Nimi:** $name\n"
         . "**IP:** $ip\n"
         . "**Sõnum:**\n"
         . "$message";

$payload = json_encode(["content" => $content]);

$ch = curl_init($webhook);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Kui Discord OK
echo json_encode(["ok" => $httpcode === 204]);
