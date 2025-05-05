<?php

$archivo = 'provedores.json';
$method = $_SERVER['REQUEST_METHOD'];
$route = $_GET['route'] ?? '';

function leerProvedores($archivo) {
  if (!file_exists($archivo)) return [];
  return json_decode(file_get_contents($archivo), true);
}

function guardarProvedores($archivo, $data) {
  file_put_contents($archivo, json_encode($data, JSON_PRETTY_PRINT));
}

header('Content-Type: application/json');

if ($route === 'provedores') {
  if ($method === 'GET') {
    // Devolver todos
    echo json_encode(leerProvedores($archivo));
  } elseif ($method === 'PUT') {
    $body = json_decode(file_get_contents('php://input'), true);
    $indice = $body['indice'] ?? null;

    if ($indice === null) {
      http_response_code(400);
      echo json_encode(['error' => 'Índice requerido']);
      exit;
    }

    $provedores = leerProvedores($archivo);

    if (!isset($provedores[$indice])) {
      http_response_code(404);
      echo json_encode(['error' => 'Proveedor no encontrado']);
      exit;
    }

    $provedores[$indice] = [
      'nombre' => $body['nombre'],
      'direccion' => $body['direccion'],
      'telefono' => $body['telefono'],
      'correo' => $body['correo'],
      'productos' => $provedores[$indice]['productos'] ?? []
    ];

    guardarProvedores($archivo, $provedores);
    echo json_encode(['ok' => true]);
  } elseif ($method === 'DELETE') {
    $body = json_decode(file_get_contents('php://input'), true);
    $indice = $body['indice'] ?? null;

    $provedores = leerProvedores($archivo);

    if ($indice === null || !isset($provedores[$indice])) {
      http_response_code(404);
      echo json_encode(['error' => 'Índice inválido']);
      exit;
    }

    array_splice($provedores, $indice, 1);
    guardarProvedores($archivo, $provedores);
    echo json_encode(['ok' => true]);
  } elseif ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
  
    if (!isset($body['nombre'], $body['direccion'], $body['telefono'], $body['correo'])) {
      http_response_code(400);
      echo json_encode(['error' => 'Datos incompletos']);
      exit;
    }
  
    $provedores = leerProvedores($archivo);
  
    // Validar si el correo ya existe
    foreach ($provedores as $p) {
      if (strtolower($p['correo']) === strtolower($body['correo'])) {
        http_response_code(409); // Conflict
        echo json_encode(['error' => 'Ya existe un proveedor con ese correo']);
        exit;
      }
    }
  
    $provedores[] = [
      'nombre' => $body['nombre'],
      'direccion' => $body['direccion'],
      'telefono' => $body['telefono'],
      'correo' => $body['correo'],
      'productos' => []
    ];
  
    guardarProvedores($archivo, $provedores);
    echo json_encode(['ok' => true]);
  }
}
