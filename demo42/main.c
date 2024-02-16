#include <stdlib.h>
#include <string.h>
#include <math.h>
#include "raylib.h"

#if defined(PLATFORM_WEB)
    #include <emscripten/emscripten.h>
#endif

#define TARGET_FPS 100
#define W 320
#define H 200
#define DROP_SIZE 100
#define BLOBS_MAX 10

#define MODE_PLASMA_DROP 1
#define MODE_COLORFUL_CURTAINS 2
#define MODE_METABALLS_RGB 3
#define MODE_METABALLS_HSV 4
#define MODE_METABALLS_WAVY_HSV 5
#define MODE_MAX 5

#define CLAMP(x, low, high)  (((x) > (high)) ? (high) : (((x) < (low)) ? (low) : (x)))

struct drop {
    Vector2 vel;
    Vector2 pos;
} drop;

struct blob {
    Vector2 vel;
    Vector2 pos;
    int radius;
} blob[BLOBS_MAX];

Texture2D gpu_data;
Color cpu_data[W * H];
int alpha = 255;
int mode = MODE_PLASMA_DROP;

static int randrange (int lower, int upper)
{
    return (rand() % (upper - lower + 1)) + lower;
}

extern inline double dist(double x1, double y1, double x2, double y2)
{
    return sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

void init_blob()
{
    for (int i = 0; i < BLOBS_MAX; i++) {
        blob[i].pos.x = randrange(0, W);
        blob[i].pos.y = randrange(0, H);
        blob[i].vel.x = 1;
        blob[i].vel.y = 1;
        blob[i].radius = randrange(10, 30);
    }
}

void init_drop()
{
    drop.pos.x = W / 2;
    drop.pos.y = H / 2;
    drop.vel.x = 1;
    drop.vel.y = 1;
}

void update_blob()
{
    for (int i = 0; i < BLOBS_MAX; i++) {
        blob[i].pos.x += blob[i].vel.x;
        blob[i].pos.y += blob[i].vel.y;

        if (blob[i].pos.x + blob[i].radius > W - 1) {
            blob[i].pos.x = W - 1 - blob[i].radius;
            blob[i].vel.x *= -1;
        }
        if (blob[i].pos.x - blob[i].radius < 0) {
            blob[i].pos.x = blob[i].radius;
            blob[i].vel.x *= -1;
        }
        if (blob[i].pos.y + blob[i].radius > H - 1) {
            blob[i].pos.y = H - blob[i].radius;
            blob[i].vel.y *= -1;
        }
        if (blob[i].pos.y - blob[i].radius < 0) {
            blob[i].pos.y = blob[i].radius;
            blob[i].vel.y *= -1;
        }
    }
}

void update_drop()
{
    double drop_half = DROP_SIZE / 2.0;

    drop.pos.x += drop.vel.x;
    drop.pos.y += drop.vel.y;

    if (drop.pos.x + drop_half > W - 1) {
        drop.pos.x = W - 1 - drop_half;
        drop.vel.x *= -1;
    }
    if (drop.pos.x - drop_half < 0) {
        drop.pos.x = drop_half;
        drop.vel.x *= -1;
    }
    if (drop.pos.y + drop_half > H - 1) {
        drop.pos.y = H - drop_half;
        drop.vel.y *= -1;
    }
    if (drop.pos.y - drop_half < 0) {
        drop.pos.y = drop_half;
        drop.vel.y *= -1;
    }
}

void draw_blobs_rgb(double time)
{
    for (int x = 0; x < W; x++) {
        for (int y = 0; y < H; y++) {
            double sum = 0;
            for (int i = 0; i < BLOBS_MAX; i++) {
                int xdif = x - blob[i].pos.x;
                int ydif = y - blob[i].pos.y;
                double d = sqrt((xdif * xdif) + (ydif * ydif));
                sum += (double)blob[i].radius / d;
            }
            int r = (255 + (int)sum * 1000) % 255;
            int g = 255 - r;
            int b = 32 + sum * 50;
            cpu_data[y * W + x] = (Color) { r, g, b, alpha };
        }
    }
}

void draw_blobs_hsv(double time)
{
    for (int x = 0; x < W; x++) {
        for (int y = 0; y < H; y++) {
            double sum = 0;
            for (int i = 0; i < BLOBS_MAX; i++) {
                double d = dist(x, y, blob[i].pos.x, blob[i].pos.y);
                sum += 80.0 * (double)blob[i].radius / d;
            }
            Color c = ColorFromHSV(CLAMP(sum, 20, 360), 1.0, 1.0);
            c.a = alpha;
            cpu_data[y * W + x] = c;
        }
    }
}

void draw_colorful_curtains(double time)
{
    double t = time;
    for(int y = 0; y < H; y++) {
        for(int x = 0; x < W; x++) {
            double u = x / (double)W;
            double v = y / (double)H;
            int r = sin(t + 9.0 + sin(t + sin(u) + cos(v))) * W / 2.0;
            int g = sin(t + 7.0 + sin(u) + cos(v)) * H * 2;
            int b = sin(t + 5.0 + cos(u) + sin(v)) * sin(u * 20.0 * sin(u + v + t)) * W;
            r += dist(x, y, r, g);
            g += dist(x, y, g, r);
            b += dist(x, y, g, b);
            cpu_data[y * W + x] = (Color) { r, g, b, alpha };
        }
    }
}

void draw_wavy_blobs_hsv(double time)
{
    for(int y = 0; y < H; y++) {
        for(int x = 0; x < W; x++) {
            double sum = y + x;
            for (int i = 0; i < BLOBS_MAX; i++) {
                double d = dist(x, y, blob[i].pos.x, blob[i].pos.y);
                sum += sin(time) * 800.0 / d;
            }
            Color c = ColorFromHSV(CLAMP(sum, 20, 360), 1.0, 1.0);
            c.a = alpha;
            cpu_data[y * W + x] = c;
        }
    }
}

void draw_plasma_drop(double time)
{
    double value = 0;
    double t = 100 + time * 10.0;

    for(int y = 0; y < H; y++) {
        for(int x = 0; x < W; x++) {

            // plasma pattern
            value = 0;
            double d1 = dist(x + t, y, W, H) / 17.0;
            double d2 = dist(x, y + t * 2.0, W / 2.0, H / 2.0) / 14.0;
            double d3 = dist(x, y + t * 1.0, W * 2, H * 2) / 13.0;
            double d4 = dist(x + t, y, 0, 0) / 12.0;
            value += sin(d1) + sin(d2) + sin(d3) + sin(d4);

            // droplet
            double drop_dist = dist(x, y, drop.pos.x, drop.pos.y);
            if (drop_dist < DROP_SIZE / 2.0) {
                d1 = dist(x, y, W, H) / 27.0;
                d2 = dist(x, y, W / 2.0, H / 2.0) / 24.0;
                d3 = dist(x, y, W * 2, H * 2) / 23.0;
                d4 = dist(x, y, 0, 0) / 22.0;
                d1 *= drop_dist / 70.0 + cos(drop_dist / 100.0) + sin(drop_dist / 100.0);
                d2 *= drop_dist / 70.0 + cos(drop_dist / 100.0) + sin(drop_dist / 100.0);
                d3 *= drop_dist / 70.0 + cos(drop_dist / 100.0) + sin(drop_dist / 100.0);
                d4 *= drop_dist / 70.0 + cos(drop_dist / 100.0) + sin(drop_dist / 100.0);
                value += sin(d1) + sin(d2) + sin(d3) + sin(d4);
            }
            int color = (32 + value) * 32;//(int)((8 + value)) * 32;
            int r = 100 + color + cos(t / 10.0) * 20;
            int g = 10 + color;
            int b = 10 + 255 - (color * sin(t / 400.0));
            cpu_data[y * W + x] = (Color) { r, g, b, alpha };
        }
    }
}

void main_loop_body()
{
    double time;
    time = GetTime();

    if (IsKeyPressed(KEY_F)) {
        if (IsWindowFullscreen()) {
            RestoreWindow();
        } else {
            ToggleBorderlessWindowed();
        }
    }

    if (IsKeyDown(KEY_DOWN)) {
        alpha -= 1;
        alpha = alpha < 0 ? 0 : alpha;
    }
    if (IsKeyDown(KEY_UP)) {
        alpha += 1;
        alpha = alpha > 255 ? 255 : alpha;
    }

    if (IsKeyPressed(KEY_SPACE)) {
        mode++;
        if (mode > MODE_MAX) {
            mode = MODE_PLASMA_DROP;
        }
    }

    switch(mode) {
    case MODE_PLASMA_DROP:
        update_drop();
        draw_plasma_drop(time);
        break;
    case MODE_COLORFUL_CURTAINS:
        update_blob();
        draw_colorful_curtains(time);
        break;
    case MODE_METABALLS_RGB:
        update_blob();
        draw_blobs_rgb(time);
        break;
    case MODE_METABALLS_HSV:
        update_blob();
        draw_blobs_hsv(time);
        break;
    case MODE_METABALLS_WAVY_HSV:
        update_blob();
        draw_wavy_blobs_hsv(time);
        break;
    }

    BeginDrawing();
        ClearBackground(WHITE);
        UpdateTexture(gpu_data, cpu_data);
        Rectangle source = {0, 0, W, H};
        Rectangle dest = {0, 0, GetRenderWidth(), GetRenderHeight()};
        Vector2 origin = {0, 0};
        DrawTexturePro(gpu_data, source, dest, origin, 0.0, WHITE);
        DrawFPS(10, 10);
        DrawText(TextFormat("Alpha: %d", alpha), 10, 30, 20, GREEN);
    EndDrawing();
}

int main(int argc, char * argv[])
{
    InitWindow(W, H, "software plasma");

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

    init_drop();
    init_blob();

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
