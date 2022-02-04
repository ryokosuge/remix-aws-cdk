.PHONY: dev
dev:
	npm run dev

.PHONY: build
build:
	npm run build
	cp package.json server/
	cd server && \
		rm -rf node_modules && \
		npm i --production && \
		rm package.json package-lock.json
