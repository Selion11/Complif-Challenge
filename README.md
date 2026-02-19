# Complif-Challenge
# Corporate Compliance API - Challenge Técnico

Este proyecto consiste en una API REST robusta diseñada para la gestión de Onboarding de empresas, incorporando un motor de cálculo de riesgo automático y un sistema de firma electrónica basado en facultades.

## Requisitos Previos

* Docker y Docker Compose instalados.
* Node.js v18+ (opcional, para ejecución local fuera de contenedores).

## Estructura de la Solución

El sistema se compone de cuatro servicios principales orquestados mediante Docker:
1. **API**: Servicio central desarrollado en Node.js/Express.
2. **PostgreSQL**: Motor de base de datos relacional.
3. **CUIT Validator**: Microservicio externo mock para la validación de CUITs.
4. **Tester**: Servicio dedicado a la ejecución automática de la suite de pruebas.

## Configuración y Setup

1. Clone el repositorio en su máquina local.
2. Localice el archivo `.env.example` en la raíz del proyecto y cree un nuevo archivo llamado `.env` basándose en este.
3. Asegúrese de que las credenciales de base de datos y la clave `JWT_SECRET` estén correctamente definidas en su archivo `.env`.

## Instrucciones de Ejecución

Para levantar todo el stack tecnológico, ejecute el siguiente comando en la raíz del proyecto:

docker-compose up --build

## Ejecución de Pruebas

La suite de pruebas unitarias e integración se dispara automáticamente al levantar el contenedor de tests mediante Docker Compose. Los tests verifican los pilares críticos del sistema:

* **Cálculo de Risk Score**: Validación del puntaje automático y penalización de +20 puntos por documentación incompleta.
* **Seguridad**: Verificación de acceso por roles (Admin/Viewer) y protección de rutas.
* **Motor de Firmas**: Validación de combinatorias y facultades requeridas en la Parte 1.

La suite de pruebas unitarias e integración se dispara automáticamente al levantar el contenedor de tests mediante Docker Compose. Para ejecutarlos manualmente en un entorno de desarrollo:

npm test

## Base de Datos y Trazabilidad

El sistema utiliza **PostgreSQL** con una arquitectura diseñada para auditoría. Al iniciar el contenedor, se ejecutan automáticamente las siguientes tareas:

* **Sincronización**: Creación y actualización de tablas mediante Sequelize.
* **Seeding**: Carga inicial de 20 empresas de prueba con diferentes perfiles de riesgo.
* **Historial**: Cada cambio de estado genera un registro en la tabla `status_history` vinculando al administrador responsable.



## Notificaciones y Logs Estructurados

Para cumplir con el requerimiento de monitoreo, se implementó un sistema de logs en formato JSON utilizando **Winston**:

* **Ubicación**: Los logs se almacenan en `logs/combined.log` y se emiten por consola.
* **Eventos**: Se notifican acciones críticas como `COMPANY_CREATED`, `STATUS_UPDATED` y `SIGNATURE_COMPLETED`.


