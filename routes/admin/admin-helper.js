const dashboardContent = `
<header class="flex justify-between items-center mb-8">
  <h2 class="text-2xl font-semibold text-gray-800">
    Welcome to Dashboard
  </h2>
  <button
    id="sidebarToggle"
    class="lg:hidden text-gray-600 hover:text-cyan-600 focus:outline-none focus:shadow-outline rounded-md p-1 z-50"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-6 h-6"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  </button>
</header>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div class="bg-white rounded-md shadow-md p-4">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Total Orders</h3>
        <p class="text-2xl font-bold text-cyan-600" id="totalOrders">0</p>
    </div>
    <div class="bg-white rounded-md shadow-md p-4">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Pending Orders</h3>
        <p class="text-2xl font-bold text-yellow-600" id="pendingOrders">0</p>
    </div>
    <div class="bg-white rounded-md shadow-md p-4">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Completed Orders</h3>
        <p class="text-2xl font-bold text-green-600" id="completedOrders">0</p>
    </div>
    <div class="bg-white rounded-md shadow-md p-4">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Revenue</h3>
        <p class="text-2xl font-bold text-blue-600" id="revenue">$0</p>
    </div>
</div>

<div class="bg-white rounded-md shadow-md p-6 mb-8">
  <h3 class="text-xl font-semibold text-gray-800 mb-4">
    Recent Orders
  </h3>
  <div class="overflow-x-auto">
    <table
      class="min-w-full leading-normal shadow-md rounded-lg overflow-hidden"
      id="ordersTable"
    >
      <thead class="bg-gray-200 text-gray-700">
        <tr>
          <th
            class="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider"
          >
            Tracking ID
          </th>
          <th
            class="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider"
          >
            Date
          </th>
          <th
            class="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider"
          >
            Status
          </th>
          <th
            class="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider"
          >
            Total
          </th>
        </tr>
      </thead>
      <tbody class="bg-white" id="ordersTableBody"></tbody>
    </table>
  </div>
  <div class="flex justify-center mt-4 items-center">
    <button
      class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
      id="prevPageBtn"
    >
      &lt;
    </button>
    <div id="pageNumbers" class="flex space-x-2"></div>
    <button
      class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded ml-2"
      id="nextPageBtn"
    >
      &gt;
    </button>
  </div>
</div>

<div class="bg-white rounded-md shadow-md p-6">
    <h3 class="text-xl font-semibold text-gray-800 mb-4">
        Quick Actions
    </h3>
    <div class="flex space-x-4">
        <button
            class="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded"
            onclick="window.location.href='/admin/products';"
        >
            Add Product
        </button>
        <button
            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            onclick="window.location.href='/admin/orders';"
        >
            View Orders
        </button>
    </div>
</div>
`;

const productsContent = `
<div class="h-full flex flex-col gap-4">
    <header class="p-4 flex justify-between items-center">
        <h1 class="text-3xl font-semibold">Products</h1>
        <button id="sidebarToggle" class="lg:hidden">
            <i class="fas fa-bars"></i>
        </button>
    </header>

    <div class="p-4 bg-white shadow-md rounded-lg flex justify-end">
        <button id="addProductButton" class="bg-cyan-500 text-white px-4 py-2 rounded-md">
            Add Product
        </button>
    </div>

    <div class="p-4 flex-1 flex flex-col">
        <div class="w-full flex flex-col lg:flex-row gap-4 items-center lg:justify-between mb-4">
            <div class="flex items-center space-x-2">
                <button id="prevPage" class="px-3 py-1 rounded-md border border-gray-300 bg-indigo-200 text-white">&lt;</button>
                <div id="pageNumbers" class="flex space-x-1"></div>
                <button id="nextPage" class="px-3 py-1 rounded-md border border-gray-300 bg-indigo-200 text-white">&gt;</button>
            </div>
            <div class="flex items-center">
                <input type="text" id="searchInput" class="border border-gray-300 p-2 rounded-md" placeholder="Search" />
            </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-lg shadow-md flex-1 flex flex-col">
            <table id="productsTable" class="w-full table table-fixed">
                <thead>
                    <tr class="bg-gray-50">
                        <th class="border-b border-gray-200 p-3 text-left hidden sm:table-cell">Product ID</th>
                        <th class="border-b border-gray-200 p-3 text-left">Product Name</th>
                        <th class="border-b border-gray-200 p-3 text-left">Total Orders</th>
                        <th class="border-b border-gray-200 p-3 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody id="productsTableBody" class="overflow-y-auto w-full">
                </tbody>
            </table>
        </div>
    </div>
</div>
`;

const ordersContent = `
<div class="h-full flex flex-col gap-4">
    <header class="p-4 flex justify-between items-center">
        <h1 class="text-3xl font-semibold">Orders</h1>
        <button id="sidebarToggle" class="lg:hidden">
            <i class="fas fa-bars"></i>
        </button>
    </header>

    <div class="p-4 flex-1 flex flex-col">
        <div class="w-full flex flex-col lg:flex-row gap-4 items-center lg:justify-between mb-4">
            <div class="flex items-center space-x-2">
                <button id="prevPage" class="px-3 py-1 rounded-md border border-gray-300 bg-indigo-200 text-white">&lt;</button>
                <div id="pageNumbers" class="flex space-x-1"></div>
                <button id="nextPage" class="px-3 py-1 rounded-md border border-gray-300 bg-indigo-200 text-white">&gt;</button>
            </div>
            <div class="flex items-center">
                <input type="text" id="searchInput" class="border border-gray-300 p-2 rounded-md" placeholder="Search" />
            </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-lg shadow-md flex-1 flex flex-col">
            <table id="ordersTable" class="w-full table table-fixed">
                <thead>
                    <tr class="bg-gray-50">
                        <th class="border-b border-gray-200 p-3 text-left">Tracking ID</th>
                        <th class="border-b border-gray-200 p-3 text-left hidden xl:table-cell">Client Email</th>
                        <th class="border-b border-gray-200 p-3 text-left">Status</th>
                        <th class="border-b border-gray-200 p-3 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody id="ordersTableBody" class="overflow-y-auto w-full">
                </tbody>
            </table>
        </div>
    </div>
</div>
`;

export { dashboardContent, productsContent, ordersContent };
