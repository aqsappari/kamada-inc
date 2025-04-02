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
    <h3 class="text-lg font-semibold text-gray-700 mb-2">
      Total Orders
    </h3>
    <p class="text-2xl font-bold text-cyan-600">800</p>
  </div>
  <div class="bg-white rounded-md shadow-md p-4">
    <h3 class="text-lg font-semibold text-gray-700 mb-2">
      Pending Orders
    </h3>
    <p class="text-2xl font-bold text-yellow-600">150</p>
  </div>
  <div class="bg-white rounded-md shadow-md p-4">
    <h3 class="text-lg font-semibold text-gray-700 mb-2">
      Completed Orders
    </h3>
    <p class="text-2xl font-bold text-green-600">650</p>
  </div>
  <div class="bg-white rounded-md shadow-md p-4">
    <h3 class="text-lg font-semibold text-gray-700 mb-2">Revenue</h3>
    <p class="text-2xl font-bold text-blue-600">$45,000</p>
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
            Order ID
          </th>
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
    >
      Add Product
    </button>
    <button
      class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
    >
      View Orders
    </button>
  </div>
</div>
`;

const productsContent = `
<div class="p-6 flex flex-col h-full">
          <h1 class="text-3xl font-semibold mb-6">Products</h1>

          <div class="bg-white rounded-md p-4 mb-6 flex-1 overflow-y-auto">
            <table
              class="min-w-full min-h-full border-collapse border border-gray-300 table-fixed"
            >
              <thead>
                <tr class="text-left bg-indigo-100">
                  <th class="p-2 font-semibold border border-gray-300 w-1/4">
                    Garments
                    <button
                      id="addGarment"
                      class="float-right cursor-pointer text-gray-500 hover:text-gray-700"
                    >
                      &#43;
                    </button>
                  </th>
                  <th class="p-2 font-semibold border border-gray-300 w-1/4">
                    Fabrics
                    <button
                      id="addFabric"
                      class="float-right cursor-pointer text-gray-500 hover:text-gray-700 hidden"
                    >
                      &#43;
                    </button>
                  </th>
                  <th class="p-2 font-semibold border border-gray-300 w-1/4">
                    Sizes
                    <button
                      id="addSize"
                      class="float-right cursor-pointer text-gray-500 hover:text-gray-700 hidden"
                    >
                      &#43;
                    </button>
                  </th>
                  <th class="p-2 font-semibold border border-gray-300 w-1/4">
                    Colors
                    <button
                      id="addColor"
                      class="float-right cursor-pointer text-gray-500 hover:text-gray-700 hidden"
                    >
                      &#43;
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody class="h-full">
                <tr>
                  <td class="p-2 border border-gray-300 align-top w-1/4">
                    <ul id="garmentsList" class="list-none"></ul>
                  </td>
                  <td class="p-2 border border-gray-300 align-top w-1/4">
                    <ul id="fabricsList" class="list-none"></ul>
                  </td>
                  <td class="p-2 border border-gray-300 align-top w-1/4">
                    <ul id="sizesList" class="list-none"></ul>
                  </td>
                  <td class="p-2 border border-gray-300 align-top w-1/4">
                    <ul id="colorsList" class="list-none"></ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div
          id="modalOverlay"
          class="fixed inset-0 bg-black opacity-50 z-40 hidden"
        ></div>

        <div
          id="garmentModal"
          class="fixed inset-0 flex items-center justify-center hidden z-50"
        >
          <div class="bg-white p-6 rounded-md shadow-lg w-1/3">
            <h2 class="text-lg font-semibold mb-4">Add New Garment</h2>
            <div id="garmentError" class="text-red-500 mb-2 hidden"></div>
            <div class="mb-4">
              <label
                for="newGarmentName"
                class="block font-medium text-sm text-gray-700"
                >Garment Name</label
              >
              <input
                id="newGarmentName"
                class="w-full border p-2 mt-1"
                placeholder="Enter garment name"
                required
              />
            </div>
            <div class="flex justify-end">
              <button
                id="cancelGarment"
                class="bg-gray-300 px-4 py-2 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                id="confirmGarment"
                class="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div
          id="fabricModal"
          class="fixed inset-0 flex items-center justify-center hidden z-[99]"
        >
          <div class="bg-white p-6 rounded-md shadow-lg w-1/3">
            <h2 class="text-lg font-semibold mb-4">Add New Fabric(s)</h2>
            <div id="fabricError" class="text-red-500 mb-2 hidden"></div>
            <div id="fabricInputs">
              <div class="flex space-x-2 mb-2">
                <input
                  class="w-1/2 border p-2"
                  placeholder="Fabric Name"
                  required
                />
                <input
                  type="number"
                  class="w-1/2 border p-2"
                  placeholder="Price"
                  required
                />
                <button
                  type="button"
                  class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
            <button
              id="addFabricInput"
              class="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
            >
              Add Fabric
            </button>
            <div class="flex justify-end mt-4">
              <button
                id="cancelFabric"
                class="bg-gray-300 px-4 py-2 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                id="confirmFabric"
                class="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div
          id="sizeModal"
          class="fixed inset-0 flex items-center justify-center hidden z-50"
        >
          <div class="bg-white p-6 rounded-md shadow-lg w-1/3">
            <h2 class="text-lg font-semibold mb-4">Add New Size</h2>
            <div id="sizeError" class="text-red-500 mb-2 hidden"></div>
            <div class="mb-4">
              <label
                for="sizeInitials"
                class="block font-medium text-sm text-gray-700"
                >Size Initials (e.g., S)</label
              >
              <input
                id="sizeInitials"
                class="w-full border p-2 mt-1"
                required
              />
            </div>
            <div id="sizeMeasurements">
              <div class="flex space-x-2 mb-2">
                <input
                  class="w-1/2 border p-2"
                  placeholder="Measurement Name (e.g., Chest)"
                  required
                />
                <input
                  class="w-1/2 border p-2"
                  placeholder="Measurement Value (e.g., 37)"
                  required
                />
                <button
                  type="button"
                  class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
            <button
              id="addMeasurement"
              class="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
            >
              Add Measurement
            </button>
            <div class="flex justify-end mt-4">
              <button
                id="cancelSize"
                class="bg-gray-300 px-4 py-2 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                id="confirmSize"
                class="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div
          id="colorModal"
          class="fixed inset-0 flex items-center justify-center hidden z-[99]"
        >
          <div class="bg-white p-6 rounded-md shadow-lg w-1/3">
            <h2 class="text-lg font-semibold mb-4">Add New Color</h2>
            <input
              id="newColorName"
              class="w-full border p-2 mb-4"
              placeholder="Enter color name"
            />
            <div class="flex justify-end">
              <button
                id="cancelColor"
                class="bg-gray-300 px-4 py-2 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                id="confirmColor"
                class="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Add
              </button>
            </div>
          </div>
        </div>
`;

export { dashboardContent, productsContent };
