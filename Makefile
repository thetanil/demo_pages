SUBDIRS := $(filter-out raylib/,$(wildcard */))
BUILDDIRS := $(addprefix build/,$(SUBDIRS))

.PHONY: all

all: build $(BUILDDIRS) raylib
	@for dir in $(SUBDIRS); do \
		if [ -f $$dir/Makefile ]; then \
		echo "*****"; \
		echo "*****  Making in $$dir"; \
		echo "*****"; \
		$(MAKE) -C $$dir; \
		fi \
	done

build:
	mkdir -p build

build/%:
	mkdir -p $@

raylib:
	if [ ! -d "raylib" ]; then \
		git clone https://github.com/raysan5/raylib.git; \
	fi

