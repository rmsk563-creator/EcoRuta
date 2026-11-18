# EcoRuta — Reglas operativas

1. Leer `PROJECT_PROFILE.md`, `ROADMAP.md` y `DECISIONS.md` antes de cambiar una fase.
2. Trabajar en `develop/mobile-app`; no modificar ni publicar `main` sin autorización explícita.
3. No mostrar funciones, métricas o datos que no provengan de una integración real.
4. No añadir autenticación ni backend sin una necesidad aprobada.
5. Nunca confirmar `.env` ni claves de proveedores.
6. Mantener accesibilidad, temas, safe areas y movimiento reducido al añadir pantallas.
7. Ejecutar `npm run typecheck`, `npm test` y `npm run build` antes de cada commit funcional.
8. Actualizar `ROADMAP.md`, `QA.md` y `CHANGELOG.md` al cerrar una fase.
9. Priorizar iOS físico sobre navegador: compilar, instalar y validar en el iPhone 15 Pro Max conectado cuando el cambio afecte la aplicación móvil.
10. Las instalaciones autorizadas deben actualizar `com.ecoruta.app` sin desinstalarla ni borrar SQLite, IndexedDB, favoritos, historial o preferencias.
11. Se permite instalar builds de desarrollo en el iPhone sin aprobación adicional. Credenciales, verificación de correo, permisos personales y cambios sensibles siempre requieren intervención del propietario.
12. No borrar datos, restablecer el dispositivo, modificar otras aplicaciones ni cambiar configuraciones sensibles sin autorización específica.
