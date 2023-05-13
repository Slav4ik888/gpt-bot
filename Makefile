build:
	docker build -t grp-bot .

run:
	docker run -d -p 3000:3000 --name grp-bot --rm grp-bot

stop: 
	docker stop grp-bot
