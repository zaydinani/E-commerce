// Fetch the data from the server
fetch("/users")
  .then((response) => response.json())
  .then((data) => {
    // Do something with the data here
    console.log(data);

    // Parse the data and format it for use by the chart library
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const userCounts = new Array(12).fill(0);
    data.forEach((user) => {
      const monthIndex = new Date(user.createdAt).getMonth();
      userCounts[monthIndex]++;
    });

    // Create the chart
    const ctx = document.getElementById("myChartUsers").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          {
            label: "Users Signed Up",
            data: userCounts,
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  })
  .catch((error) => console.error(error));

//!---------------------------------------------------------------

// Fetch the data from the server
fetch("/orders")
  .then((response) => response.json())
  .then((data) => {
    // Do something with the data here
    console.log(data);

    // Parse the data and format it for use by the chart library
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const orderCounts = new Array(12).fill(0);
    data.forEach((order) => {
      const monthIndex = new Date(order.createdAt).getMonth();
      orderCounts[monthIndex]++;
    });

    // Create the chart
    const ctx = document.getElementById("myChartOrders").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "orders",
            data: orderCounts,
            backgroundColor: "rgba(0, 255, 0, 0.2)",
            borderColor: "blue",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  })
  .catch((error) => console.error(error));

//!---------------------------------------------------------------

// Fetch the data from the server
fetch("/best/selling")
  .then((response) => response.json())
  .then((data) => {
    // Do something with the data here
    console.log(data);

    // Parse the data and format it for use by the chart library
    const labels = data.map((product) => product.name);
    const soldCounts = data.map((product) => product.sold);

    // Create the chart
    const ctx = document.getElementById("myChartSales").getContext("2d");
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Sold",
            data: soldCounts,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  })
  .catch((error) => console.error(error));

//!------------------------------------------
// Fetch the data from the server
fetch("/profit")
  .then((response) => response.json())
  .then((data) => {
    // Do something with the data here
    console.log(data);

    // Parse the data and format it for use by the chart library
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const profitByMonth = new Array(12).fill(0);
    data.forEach((profit) => {
      const monthIndex = profit._id - 1;
      profitByMonth[monthIndex] = profit.totalProfit;
    });

    // Create the chart
    const ctx = document.getElementById("myChartProfit").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          {
            label: "Total Profit",
            data: profitByMonth,
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  })
  .catch((error) => console.error(error));
