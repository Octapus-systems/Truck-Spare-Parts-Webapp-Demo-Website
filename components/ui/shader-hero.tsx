export function ShaderHeroBackground() {
  return (
    <div aria-hidden="true" className="shader-hero-background">
      <video
        className="hero-background-video"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/hero-truck-seamless-poster.jpg"
      >
        <source src="/hero-truck-seamless.mp4" type="video/mp4" />
      </video>
      <div className="shader-hero-vignette" />
      <div className="shader-hero-grain" />
    </div>
  );
}
