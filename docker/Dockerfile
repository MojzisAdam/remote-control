# PHP 8.4 image for local backend development. Not for production.
# Build context is docker/ — app code arrives via the bind mount.

FROM php:8.4-cli

# git is required: Composer and sebastian/version shell out to it.
RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip \
    && rm -rf /var/lib/apt/lists/*

# The rest (mbstring, xml, dom, ctype, tokenizer, fileinfo, json,
# openssl) is already built into the official image.
COPY --from=mlocati/php-extension-installer:latest \
     /usr/bin/install-php-extensions /usr/local/bin/

RUN install-php-extensions \
        bcmath \
        intl \
        pdo_mysql \
        gd \
        zip \
        opcache

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /app

EXPOSE 8000
