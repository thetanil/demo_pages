SUBDIRS := $(filter-out raylib/ build/ screenshots/,$(wildcard */))

# PLATFORM              ?= PLATFORM_WEB
PLATFORM              ?= PLATFORM_DESKTOP

.PHONY: all clean raylib

all: raylib
	@echo "-- building $(SUBDIRS)"
	@for dir in $(SUBDIRS); do \
		if [ -f $$dir/Makefile ]; then \
			mkdir -p build/$$dir; \
			echo "-- Making in $$dir"; \
			$(MAKE) -C $(basename $$dir); \
		fi \
	done

clean:
	rm -rf build
	$(MAKE) -C raylib/src clean
	@for dir in $(SUBDIRS); do \
		if [ -f $$dir/Makefile ]; then \
			$(MAKE) -C $(basename $$dir) clean; \
		fi \
	done

raylib:
	@echo "-- building raylib (if necessary)"
	if [ ! -d "raylib" ]; then \
		git clone --depth 1 https://github.com/raysan5/raylib.git; \
	fi
	if [ ! -f "raylib/src/libraylib.a" ]; then \
		$(MAKE) -C raylib/src; \
    fi

