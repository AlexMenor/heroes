# Microservicio de geolocalización

## Instrucciones para el desarrollo

En el archivo `.env.template` están recogidas las variables de entorno que hacen falta para configurar este microservicio.
Podemos simplemente copiar este archivo a otro de nombre `.env` y `dotenv` se encargará de usarlas.
También necesitamos un archivo `serviceAccountKey.json` que se puede obtener en Firebase Cloud Messaging y que hay que situar en este directorio.

Una vez hecho esto, simplemente ejecutamos:

```
docker-compose up
```
