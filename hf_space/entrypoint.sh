#!/bin/bash
set -e

mkdir -p /data

/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
