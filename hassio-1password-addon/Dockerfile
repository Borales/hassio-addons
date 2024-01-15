ARG BUILD_FROM

FROM node:20.11-alpine AS node
FROM 1password/op:2.24.0 as onePassword

FROM $BUILD_FROM

ENV APP_PORT=8000

COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/share /usr/local/share
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

COPY --from=onePassword /usr/local/bin /usr/local/bin

# Add crontab entry for fetching a url every 5 minutes
RUN echo "*/1 * * * * /usr/bin/curl -s -S -X GET \"http://localhost:${APP_PORT}/api/cron\" > /dev/null" >> /etc/crontabs/root

# Copy data for add-on
COPY run.sh /
RUN chmod a+x /run.sh

EXPOSE $APP_PORT
CMD ["/run.sh"]
