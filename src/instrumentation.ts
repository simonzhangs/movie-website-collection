/**
 * Next.js Instrumentation 文件
 * 在服务器启动时执行一次，用于配置全局 HTTP 代理
 *
 * 解决问题：Node.js 内置 fetch（undici）不读取系统代理设置，
 * 需要手动设置 ProxyAgent 才能通过代理（如 Clash 127.0.0.1:7890）访问外网。
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
      const { ProxyAgent, setGlobalDispatcher } = await import('undici');
      setGlobalDispatcher(new ProxyAgent(proxyUrl));
      console.log(`[instrumentation] Global proxy set to ${proxyUrl}`);
    }
  }
}
