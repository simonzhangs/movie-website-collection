/**
 * Next.js Instrumentation 文件
 * 在服务器启动时执行一次，用于配置全局 HTTP 代理
 *
 * 解决问题：Node.js 内置 fetch（undici）不读取系统代理设置，
 * 需要手动配置才能通过代理（如 Clash 127.0.0.1:7890）访问外网。
 *
 * 使用 EnvHttpProxyAgent 而非 ProxyAgent：
 *   - 自动读取 HTTP_PROXY / HTTPS_PROXY 环境变量
 *   - 自动尊重 NO_PROXY 环境变量（排除 localhost 等）
 *   - 避免 Next.js 内部 RSC 通信被代理拦截
 */

export async function register() {
  // 仅在 Node.js 运行时配置（非 Edge）
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const proxyUrl =
      process.env.HTTPS_PROXY ||
      process.env.HTTP_PROXY ||
      process.env.https_proxy ||
      process.env.http_proxy;

    if (proxyUrl) {
      const { EnvHttpProxyAgent, setGlobalDispatcher } = await import('undici');
      setGlobalDispatcher(new EnvHttpProxyAgent());
      console.log(`[instrumentation] Proxy configured: ${proxyUrl}`);
      console.log(`[instrumentation] NO_PROXY: ${process.env.NO_PROXY || 'localhost,127.0.0.1'}`);
    }
  }
}
