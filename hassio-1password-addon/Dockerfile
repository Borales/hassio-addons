ARG BUILD_FROM

FROM node:20.11-alpine AS node
FROM 1password/op:2.24.0 as onePassword

FROM $BUILD_FROM

COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/share /usr/local/share
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

COPY --from=onePassword /usr/local/bin /usr/local/bin

# Copy data for add-on
COPY run.sh /
RUN chmod a+x /run.sh

EXPOSE 8000
CMD ["/run.sh"]
