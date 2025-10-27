import Motion from "@/lib/motion";

export default function Pub() {
  return (
    <section className="relative w-full bg-white overflow-hidden px-4 py-6 lg:py-16 md:p-20 lg:p-32">
      <Motion variant="verticalSlideIn">
        <div className="relative w-full px-4">
          <div className="relative flex flex-col md:flex-row items-center justify-center">
            <Motion variant="verticalSlideIn" className="w-full">
              <div className="bg-green-900 relative mmax-w-xs ssm:max-w-sm ww-full aspect-video rounded-2xl overflow-hidden mb-8 mx-auto">
                <video
                  className="block w-full h-auto"
                  src="/assets/videos/video.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                />
              </div>
            </Motion>
          </div>
        </div>
      </Motion>
    </section>
  );
}
