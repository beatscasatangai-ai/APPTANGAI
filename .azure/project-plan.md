# Plan de proyecto: Asociación Tangai

## Objetivo

Preparar la primera fase de una aplicación web adaptable y una aplicación Android
para gestionar miembros, acreditar donaciones presenciales en puntos y canjear
refrescos en la barra. No se procesarán pagos en línea.

## Stack y estructura

- React + TypeScript + Vite para la aplicación web.
- Capacitor para empaquetar la misma aplicación en Android.
- Supabase Auth y PostgreSQL para autenticación y datos persistentes.
- Row Level Security para aislar datos y proteger operaciones por rol.
- Supabase Edge Functions o funciones SQL transaccionales para emitir y consumir
  códigos QR de forma autoritativa.
- Realtime queda disponible para actualizaciones posteriores; no es requisito
  para completar los flujos iniciales.

## Roles y flujos

- **Socio:** puede registrarse, iniciar sesión tras la aprobación del personal,
  consultar su saldo e historial, escanear un QR de donación y solicitar un
  refresco disponible con sus puntos.
- **Personal:** puede aprobar altas, registrar una donación recibida en efectivo
  o por datáfono, emitir el QR temporal para acreditar puntos y validar el QR del
  vale en barra.
- **Administración:** incluye los permisos de personal y puede administrar
  productos/precios y consultar el historial de auditoría.

Las donaciones se registran en euros y acreditan 100 puntos por euro. Los precios
de los refrescos se expresan en puntos y son configurables por administración.
El QR de donación y el QR del vale caducan a los 5 minutos. Cada QR es de un solo
uso; el vale debe descontar puntos y marcarse como canjeado en una operación
atómica para evitar dobles canjes.

## Datos iniciales

- Perfiles de usuario y estado de aprobación.
- Roles y permisos.
- Productos de barra activos con precio en puntos.
- Registro inmutable de donaciones: importe, puntos, medio de recepción,
  personal que la registró y socio destinatario.
- Saldo/libro de movimientos de puntos.
- Códigos temporales de acreditación y vales, con estado y caducidad.
- Registro de canjes y auditoría de acciones de personal/administración.

Los códigos QR no contendrán datos personales ni importes confiables para el
cliente. Las operaciones sensibles se validarán en el servidor y las políticas
de base de datos impedirán que el cliente cambie saldos, roles o estados de
canje directamente.

## Alcance de la primera entrega

1. Crear la estructura web + Android lista para ejecutar.
2. Añadir configuración de Supabase mediante variables de entorno de ejemplo,
   sin incluir credenciales reales.
3. Preparar migraciones de esquema y políticas RLS para perfiles, roles,
   donaciones, movimientos, productos, vales, canjes y auditoría.
4. Implementar pantallas iniciales para acceso/registro, aprobación, saldo e
   historial del socio, y vistas de personal para registrar donaciones,
   escanear/validar QR y administrar refrescos.
5. Validar entradas, permisos, caducidad y uso único en las operaciones del
   servidor; añadir pruebas para autorización y doble canje.

## Fuera de alcance

La carrera de camellos, avatares, ruletas, reservas de estudios, tablón de
anuncios, notificaciones y pagos en línea se posponen para fases posteriores.

## Criterios de aceptación

- El mismo frontend se ejecuta en navegador y puede compilarse para Android.
- Un socio no aprobado no accede al monedero.
- Solo personal autorizado puede registrar donaciones y emitir códigos de
  acreditación.
- Un QR de donación vencido o ya utilizado no acredita puntos.
- Un vale cuesta el precio vigente del producto, expira a los 5 minutos y no
  puede canjearse más de una vez.
- Saldo y registros coinciden tras acreditaciones y canjes concurrentes.
- Las operaciones quedan asociadas al actor y a su fecha para conciliación.
- La aplicación arranca sin secretos en el repositorio y documenta la
  configuración local necesaria.
