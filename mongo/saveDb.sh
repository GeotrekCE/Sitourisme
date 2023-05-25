zip -r cron/db$(date +%d-%m-%y).zip mongodb/.data/db/*
find /home/mongodb/cron -mtime +3 -exec rm {} \;
