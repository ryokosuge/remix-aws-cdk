.PHONY: dev
dev: app/dev

.PHONY: app/dev
app/dev:
	$(MAKE) -C app dev

.PHONY: build
build: app/build

.PHONY: app/build
app/build:
	$(MAKE) -C app build

.PHONY: deploy
deploy: build cdk/deploy

.PHONY: cdk/deploy
cdk/deploy:
	$(MAKE) -C cdk deploy

.PHONY: destroy
destroy:
	$(MAKE) -C cdk destroy
