<?php
/* photos.php — the ONE dynamic piece of an otherwise fully static site.
 *
 * Scans photos/ on every request and reports which image files are
 * actually there right now, grouped by building id (the part of the
 * filename before the first "-", e.g. admin-1.jpg -> "admin"). This is
 * what makes the carousel automatic: script.js calls this endpoint on
 * load, so dropping a file into photos/ makes it appear next reload, and
 * deleting a file makes it disappear — no manual editing of data.js.
 *
 * Requires a PHP-capable server. If unavailable (static-only host, or
 * opening index.html directly from disk), script.js quietly falls back
 * to whatever is manually listed in each building's `photos` array in
 * data.js — the rest of the site is unaffected either way.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-cache');

$dir = __DIR__ . '/photos';
$knownBuildings = ['admin', 'lab', 'tech', 'dorm'];
$result = array_fill_keys($knownBuildings, []);
$allowedExt = ['jpg', 'jpeg', 'png', 'webp'];

if (is_dir($dir)) {
    foreach (scandir($dir) as $file) {
        if ($file === '.' || $file === '..') continue;

        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (!in_array($ext, $allowedExt, true)) continue;

        $prefix = explode('-', $file)[0];
        if (!in_array($prefix, $knownBuildings, true)) continue;

        $result[$prefix][] = 'photos/' . $file;
    }

    foreach ($result as &$list) {
        natsort($list);          // admin-2.jpg before admin-10.jpg
        $list = array_values($list);
    }
    unset($list);
}

echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
