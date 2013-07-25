## Develop:

serve:
	python -m SimpleHTTPServer

deploy:
	s3cmd put index.html s3://wedomainsearch.com/
	s3cmd sync static s3://wedomainsearch.com/static

## CSS:

css_watch:
	compass watch ./compass

css:
	compass compile ./compass

css_production:
	compass compile ./compass --output-style compressed --force
