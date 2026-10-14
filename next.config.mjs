/** @type {import('next').NextConfig} */
const nextConfig = {
  // The CV's file name is what it saves under (Vercel names static files
  // after their path, overriding the link's `download` name), so the file
  // carries the full name; the old short path still leads to it.
  async redirects() {
    return [
      { source: "/cv.pdf", destination: "/Roman_Myronov_CV_2026.pdf", permanent: false },
    ];
  },
};

export default nextConfig;
