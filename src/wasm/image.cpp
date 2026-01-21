#include <stdint.h>
#include <algorithm>
#include <cmath>

extern "C" {

inline uint8_t clamp(int v) {
  return std::min(255, std::max(0, v));
}

// Core
void invert(uint8_t* d, int n, float amount) {
  for (int i = 0; i < n; i++) {
    if ((i & 3) == 3) continue;
    d[i] = clamp(d[i] * (1 - amount) + (255 - d[i]) * amount);
  }
}

void grayscale(uint8_t* d, int n, float amount) {
  for (int i = 0; i < n; i += 4) {
    uint8_t g = (d[i] + d[i+1] + d[i+2]) / 3;
    d[i]   = clamp(d[i]   * (1 - amount) + g * amount);
    d[i+1] = clamp(d[i+1] * (1 - amount) + g * amount);
    d[i+2] = clamp(d[i+2] * (1 - amount) + g * amount);
  }
}

void brightness(uint8_t* d, int n, int v) {
  for (int i = 0; i < n; i++) if ((i & 3) != 3)
    d[i] = clamp(d[i] + v);
}

void contrast(uint8_t* d, int n, float c) {
  for (int i = 0; i < n; i++) if ((i & 3) != 3)
    d[i] = clamp((d[i] - 128) * c + 128);
}

// Tone
void gamma(uint8_t* d, int n, float g) {
  for (int i = 0; i < n; i++) if ((i & 3) != 3)
    d[i] = clamp(pow(d[i] / 255.0, g) * 255);
}

void sepia(uint8_t* d, int n, float amount) {
  for (int i = 0; i < n; i += 4) {
    int r=d[i], g=d[i+1], b=d[i+2];
    int sr = 0.393*r + 0.769*g + 0.189*b;
    int sg = 0.349*r + 0.686*g + 0.168*b;
    int sb = 0.272*r + 0.534*g + 0.131*b;
    d[i]   = clamp(r*(1-amount)+sr*amount);
    d[i+1] = clamp(g*(1-amount)+sg*amount);
    d[i+2] = clamp(b*(1-amount)+sb*amount);
  }
}

void saturation(uint8_t* d, int n, float s) {
  for (int i=0;i<n;i+=4){
    float g=(d[i]+d[i+1]+d[i+2])/3.0f;
    d[i]   = clamp(g + (d[i]-g)*s);
    d[i+1] = clamp(g + (d[i+1]-g)*s);
    d[i+2] = clamp(g + (d[i+2]-g)*s);
  }
}

// Color
void tint(uint8_t* d, int n, int r, int g, int b) {
  for(int i=0;i<n;i+=4){
    d[i]   = clamp(d[i]+r);
    d[i+1] = clamp(d[i+1]+g);
    d[i+2] = clamp(d[i+2]+b);
  }
}

void temperature(uint8_t* d,int n,float t){
  for(int i=0;i<n;i+=4){
    d[i]   = clamp(d[i]   + 20*t);
    d[i+2] = clamp(d[i+2] - 20*t);
  }
}

// Stylize
void fade(uint8_t* d,int n,float a){
  for(int i=0;i<n;i++) if((i&3)!=3)
    d[i]=clamp(d[i]*(1-a)+255*a);
}

void solarize(uint8_t* d,int n,float t){
  for(int i=0;i<n;i++) if((i&3)!=3 && d[i]>t*255)
    d[i]=255-d[i];
}

}
