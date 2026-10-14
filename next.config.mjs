/** @type {import('next').NextConfig} */
const nextConfig = {
  // The CV saves under a proper name however it's reached — some browsers
  // ignore the link's `download` file name and fall back to "cv.pdf".
  async headers() {
    return [
      {
        source: "/cv.pdf",
        headers: [
          {
            key: "Content-Disposition",
            value: 'attachment; filename="Roman Myronov CV 2026.pdf"',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
