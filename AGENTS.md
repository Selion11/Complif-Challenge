# AGENTS.md

Este documento proporciona una descripción técnica detallada de la arquitectura, el flujo de datos y las políticas de seguridad del sistema para facilitar la navegación y comprensión por parte de evaluadores técnicos y agentes de inteligencia artificial.

## 1. Arquitectura del Sistema

El proyecto está construido sobre una arquitectura MVC (Modelo-Vista-Controlador) desacoplada para garantizar la escalabilidad y el mantenimiento independiente de la lógica de negocio y la persistencia de datos.

* **Capa de Modelos (src/models)**: Utiliza Sequelize como ORM para la interacción con PostgreSQL. Define esquemas relacionales para la gestión de empresas, usuarios, documentos y trazabilidad de estados.
* **Capa de Controladores (src/controllers)**: Gestiona las peticiones HTTP, valida la existencia de recursos y coordina las respuestas estandarizadas del servidor.
* **Capa de Servicios (src/services)**: Contiene la lógica de negocio centralizada, incluyendo el motor de cálculo de riesgo automático y la validación de facultades de firma.
* **Capa de Middlewares (src/middlewares)**: Implementa la seguridad mediante la verificación de tokens JWT, el control de acceso basado en roles (Admin/Viewer) y la gestión global de excepciones.



## 2. Gestión de Identidad y Seguridad

La plataforma implementa una jerarquía de acceso estricta para asegurar la integridad de los datos y el cumplimiento de normativas multi-inquilino (multi-tenant).

* **Autenticación**: Basada en estándares JWT. Cada token emitido contiene el ID de usuario, su rol asignado y el CUIT de la empresa vinculada.
* **Autorización de Roles**:
    * **Admin**: Posee facultades para modificar estados de aprobación, gestionar grupos de firmantes y configurar reglas de negocio.
    * **Viewer**: Acceso limitado exclusivamente a la lectura de información perteneciente a su organización.
* **Aislamiento de Datos**: El middleware de seguridad valida dinámicamente que el CUIT solicitado en cualquier operación coincida con el CUIT embebido en el token del usuario activo.

## 3. Persistencia y Trazabilidad

El diseño de la base de datos prioriza la auditoría continua de las acciones administrativas.

* **Historial de Estados**: Cualquier transición en el estado de aprobación de una empresa es registrada mandatoriamente en la tabla status_history, incluyendo el estado anterior, el nuevo estado, un comentario justificativo y el ID del administrador responsable.
* **Gestión Documental**: El sistema mantiene referencias lógicas a los archivos almacenados físicamente, vinculándolos mediante claves foráneas al registro de la empresa correspondiente.
* **Notificaciones por Eventos**: Se utiliza Winston para generar un flujo de logs estructurados en formato JSON. Estos logs actúan como notificaciones internas para eventos críticos como COMPANY_CREATED, STATUS_UPDATED y SIGNATURE_COMPLETED.



## 4. Flujo de Ejecución de Pruebas

La suite de pruebas está automatizada con Jest y Supertest, cubriendo tanto la lógica unitaria como la integración de los endpoints:

* **Pruebas de Integración**: Simulan el ciclo de vida completo de una entidad en el sistema, desde el registro inicial hasta la aprobación final por firma electrónica.
* **Validación de Mocks**: Se utiliza el entorno de pruebas para simular respuestas del microservicio externo de validación de CUIT, asegurando que los tests sean deterministas e independientes de servicios externos.