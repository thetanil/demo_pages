#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <time.h>
#include "raylib.h"

#if defined(PLATFORM_WEB)
    #include <emscripten/emscripten.h>
#endif

#define TARGET_FPS 60
#define W 320
#define H 200
#define MAX_HEALTH 255

#define CLAMP(x, low, high)  (((x) > (high)) ? (high) : (((x) < (low)) ? (low) : (x)))

#define CELL_MAX_DECAY      255
#define CELL_MIN_DECAY      10
#define cell_state_dead     0
#define cell_state_alive    1
#define cell_state_decaying 2
#define cell_state_spawning 3
struct cell {
    int state;
    int decay;
};
struct cell universe[W * H];

int seed;
Texture2D gpu_data;
Color cpu_data[W * H];

extern inline double dist(double x1, double y1, double x2, double y2)
{
    return sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

static int cell_get_state(int x, int y)
{
    return universe[((y + H) % H) * W + ((x + W) % W)].state;
}

static void cell_set_state(int x, int y, int value)
{
    universe[((y + H) % H) * W + ((x + W) % W)].state = value;
}

static int cell_get_decay(int x, int y)
{
    return universe[((y + H) % H) * W + ((x + W) % W)].decay;
}

static void cell_set_decay(int x, int y, int value)
{
    value = CLAMP(value, CELL_MIN_DECAY, CELL_MAX_DECAY);
    universe[((y + H) % H) * W + ((x + W) % W)].decay = value;
}


static int cell_tick(int x, int y)
{
    int r1, c1;
    int n = 0;
    for (r1 = y - 1; r1 <= y + 1; r1++) {
        for (c1 = x - 1; c1 <= x + 1; c1++) {
            if (cell_get_state(c1, r1) == cell_state_alive) {
                n++;
            }
        }
    }

    int was_alive = 0;
    if (cell_get_state(x, y) == cell_state_alive) {
        was_alive = 1;
        n--;
    }

    int cell_state = cell_get_state(x, y);
    int cell_decay = cell_get_decay(x, y);
    int is_alive = (n == 3 || (n == 2 && cell_state == cell_state_alive));
    if (is_alive) {
        cell_state = cell_state_alive;
    } else if (was_alive && !is_alive) {
        cell_state = cell_state_decaying;
        cell_set_decay(x, y, CELL_MAX_DECAY);
    } else if (cell_state == cell_state_decaying && cell_decay == CELL_MIN_DECAY) {
        cell_state = cell_state_spawning;
    } else if (cell_state == cell_state_decaying) {
        cell_set_decay(x, y, cell_decay - 1);
    } else if (cell_state == cell_state_spawning && cell_decay < CELL_MAX_DECAY) {
        cell_set_decay(x, y, cell_decay + 1);
    }

    if (cell_state == cell_state_spawning && cell_decay == CELL_MAX_DECAY) {
        cell_state = cell_state_alive;
    }


    return cell_state;
}

static Color cell_get_color(int x, int y)
{
    int cell_state = cell_get_state(x, y);
    int cell_decay = cell_get_decay(x, y);
    /*
        double t = GetTime() * 10.0;
        double value = 0;
        double d1 = dist(x + t, y, W, H) / 17.0;
        double d2 = dist(x, y + t * 2.0, W / 2.0, H / 2.0) / 14.0;
        double d3 = dist(x, y + t * 1.0, W * 2, H * 2) / 13.0;
        double d4 = dist(x + t, y, 0, 0) / 12.0;
        value = (sin(d1) + sin(d2) + sin(d3) + sin(d4)) / 4.0;
        */
    if (cell_state == cell_state_alive) {
        float c = (cell_decay / 255.0);
        return ColorFromHSV(CLAMP(c * 360.0, 20, 360), 1.0, .7);
    } else if (cell_state == cell_state_dead) {
        return YELLOW;
    } else {
        float c = (cell_decay / 255.0);
        return ColorFromHSV(CLAMP(c * 360.0, 20, 360), 1.0, 1.0);
    }
}

static void universe_init()
{
    int y, x;
    srand(seed);
    for (y = 0; y < H; y++) {
        for (x = 0; x < W; x++) {
            if (rand() > RAND_MAX / 2) {
                cell_set_state(x, y, cell_state_alive);
                cell_set_decay(x, y, CELL_MAX_DECAY);
            } else {
                cell_set_state(x, y, cell_state_decaying);
                cell_set_decay(x, y, CELL_MIN_DECAY);
            }
        }
    }
}

static void universe_tick()
{
    static int new[W * H];
    int y, x;
    int cell_state;

    for (y = 0; y < H; y++) {
        for (x = 0; x < W; x++) {
            cell_state = cell_tick(x, y);
            new[y * W + x] = cell_state;
        }
    }

    for (y = 0; y < H; y++) {
        for (x = 0; x < W; x++) {
            cell_state = new[y * W+ x];
            cell_set_state(x, y, cell_state);
        }
    }

}

static void universe_draw()
{
    int y, x;
    for (y = 0; y < H; y++) {
        for (x = 0; x < W; x++) {
            cpu_data[y * W + x] = cell_get_color(x, y);
        }
    }
}

void main_loop_body()
{
    if (IsKeyPressed(KEY_F) || IsGestureDetected(GESTURE_TAP)) {
        if (IsWindowFullscreen()) {
            RestoreWindow();
        } else {
            ToggleBorderlessWindowed();
        }
    }

    universe_tick();

    universe_draw();
    BeginDrawing();
        ClearBackground(WHITE);
        UpdateTexture(gpu_data, cpu_data);
        Rectangle source = {0, 0, W, H};
        Rectangle dest = {0, 0, GetRenderWidth(), GetRenderHeight()};
        Vector2 origin = {0, 0};
        DrawTexturePro(gpu_data, source, dest, origin, 0.0, WHITE);
        DrawFPS(10, 10);
    EndDrawing();
}

int main(int argc, char * argv[])
{
    InitWindow(W, H, "Conway's Game of Life");

    Image img = {
        .width = W,
        .height = H,
        .format = PIXELFORMAT_UNCOMPRESSED_R8G8B8A8,
        .mipmaps = 1
    };
    img.data = (Color *)malloc(W * H * sizeof(Color));
    memcpy(img.data, cpu_data, (W * H * sizeof(Color)));
    gpu_data = LoadTextureFromImage(img);
    UnloadImage(img);

    seed = time(NULL);
    universe_init();

#if defined(PLATFORM_WEB)
    emscripten_set_main_loop(main_loop_body, 120, 1);
#else

    SetTargetFPS(TARGET_FPS);
    DisableCursor();
    ToggleBorderlessWindowed();
    while (!WindowShouldClose()) {
        main_loop_body();
    }
    EnableCursor();
#endif

    CloseWindow();
    return 0;
}
