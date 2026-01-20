import useDSL from "./generated/useDSL";
import { ComponentProps } from "./generated/types";

// SSR 页面
export async function getServerSideProps() {
  // 可以在服务器端预计算一些状态
  return {
    props: {
      initialSearchParams: {
        query: "",
        category: "all",
      },
      initialState: {
        input: "",
        date: new Date().toISOString(),
      },
    } as ComponentProps,
  };
}

// 页面组件
export default function Page(props: ComponentProps) {
  const { ui, ui2, state, searchParams } = useDSL(props);

  // 选择要渲染的 UI 部分
  return (
    <div className="container">
      <header>
        <h1>Search Interface</h1>
      </header>

      <main>
        {/* 渲染主要的 UI 部分 */}
        <div className="form-section">
          {ui.textField && ui.textField({})}
          {ui.datePicker && ui.datePicker({})}
          {ui.button && ui.button({})}
        </div>

        {/* 渲染备用 UI 部分 */}
        <div className="alternative-section">
          {ui2.button && ui2.button({})}
        </div>

        {/* 显示状态信息 */}
        <div className="debug-info">
          <h3>Current State:</h3>
          <pre>{JSON.stringify(state, null, 2)}</pre>

          <h3>Search Params:</h3>
          <pre>{JSON.stringify(searchParams, null, 2)}</pre>
        </div>
      </main>
    </div>
  );
}
