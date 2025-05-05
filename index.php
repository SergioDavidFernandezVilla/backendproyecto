<?php

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents('php://input'), true);
$productosFile = 'productos.json';
$ticketsFile = 'tickets.json';

// Funciones auxiliares
function loadProductos() {
    global $productosFile;
    if (!file_exists($productosFile)) file_put_contents($productosFile, '[]');
    return json_decode(file_get_contents($productosFile), true);
}

function saveProductos($productos) {
    global $productosFile;
    file_put_contents($productosFile, json_encode($productos, JSON_PRETTY_PRINT));
}

function generarFolio() {
    return uniqid("FOLIO_");
}

// Ruta simple por parámetro GET
$route = $_GET['route'] ?? '';

// API
switch ("$method:$route") {

    case 'GET:productos':
        echo json_encode(loadProductos());
        break;

    case 'POST:producto':
        $productos = loadProductos();
        $data['folio'] = generarFolio();
        $productos[] = $data;
        saveProductos($productos);
        echo json_encode(['mensaje' => 'Producto creado', 'producto' => $data]);
        break;

    case 'PUT:producto':
        $productos = loadProductos();
        foreach ($productos as &$producto) {
            if ($producto['folio'] === $data['folio']) {
                $producto = array_merge($producto, $data);
                saveProductos($productos);
                echo json_encode(['mensaje' => 'Producto actualizado', 'producto' => $producto]);
                return;
            }
        }
        echo json_encode(['error' => 'Producto no encontrado']);
        break;

    case 'DELETE:producto':
        $productos = loadProductos();
        $nuevos = array_filter($productos, fn($p) => $p['folio'] !== $data['folio']);
        saveProductos(array_values($nuevos));
        echo json_encode(['mensaje' => 'Producto eliminado']);
        break;

    case 'GET:producto':
        $productos = loadProductos();
        $folio = $_GET['folio'] ?? '';
        foreach ($productos as $producto) {
            if ($producto['folio'] === $folio) {
                echo json_encode($producto);
                return;
            }
        }
        echo json_encode(['error' => 'Producto no encontrado']);
        break;

    case 'POST:comprar':
        $productos = loadProductos();
        $folio = $data['folio'] ?? '';
        $cantidad = $data['cantidad'] ?? 1;

        foreach ($productos as &$producto) {
            if ($producto['folio'] === $folio) {
                if ($producto['stock'] < $cantidad) {
                    echo json_encode(['error' => 'Stock insuficiente']);
                    return;
                }

                $producto['stock'] -= $cantidad;
                $total = $producto['precio'] * $cantidad;

                // Generar ticket
                $ticket = [
                    'ticket_id' => uniqid("TICKET_"),
                    'producto' => $producto['nombre'],
                    'folio_producto' => $folio,
                    'cantidad' => $cantidad,
                    'total' => $total,
                    'fecha' => date('Y-m-d H:i:s')
                ];

                // Guardar ticket
                if (!file_exists($ticketsFile)) file_put_contents($ticketsFile, '[]');
                $tickets = json_decode(file_get_contents($ticketsFile), true);
                $tickets[] = $ticket;
                file_put_contents($ticketsFile, json_encode($tickets, JSON_PRETTY_PRINT));

                saveProductos($productos);
                echo json_encode(['mensaje' => 'Compra realizada', 'ticket' => $ticket]);
                return;
            }
        }
        echo json_encode(['error' => 'Producto no encontrado']);
        break;

    default:
        echo json_encode(['error' => 'Ruta o método no válido']);
}
