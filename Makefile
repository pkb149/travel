.PHONY: dev build lint deploy deploy-api check d1-create d1-migrate types clean preview

dev:
	npm run dev

build:
	npm run build

lint:
	npm run lint

# Pages — frontend (travel-7l1.pages.dev, suffix due to global name collision)
deploy:
	npm run build && wrangler pages deploy out --project-name travel --branch main

deploy-api:
	wrangler deploy --config api/wrangler.jsonc

deploy-all: deploy deploy-api

check: lint build

d1-create:
	wrangler d1 create travel-db

d1-migrate:
	wrangler d1 migrations apply travel-db --remote

types:
	wrangler types

preview:
	npx wrangler pages dev out --compatibility-date 2026-08-24

clean:
	rm -rf .next out .open-next .vercel

# Playwright UI tests (per project-creation skill §9)
test-ui:
	npx playwright test

test-ui-deployed:
	PLAYWRIGHT_BASE_URL=https://travel-7l1.pages.dev npx playwright test
