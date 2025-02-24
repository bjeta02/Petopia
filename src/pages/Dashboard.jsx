import React from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';

const Dashboard = () => {
    // Dummy data for charts
    const barData = {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [
            {
                label: 'Sales',
                backgroundColor: '#42A5F5',
                data: [65, 59, 80, 81, 56]
            },
            {   
                label: 'Expenses',
                backgroundColor: '#FFA726',
                data: [28, 48, 40, 19, 86]
            }
        ]
    };

    const pieData = {
        labels: ['Electronics', 'Fashion', 'Grocery', 'Home'],
        datasets: [
            {
                data: [300, 50, 100, 80],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#66BB6A'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#66BB6A']
            }
        ]
    };

    const lineData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'Profit',
                data: [65, 59, 80, 81, 56, 55, 40],
                fill: false,
                borderColor: '#42A5F5',
                tension: 0.4
            }
        ]
    };

    const doughnutData = {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
        datasets: [
            {
                data: [300, 50, 100, 150, 200],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#66BB6A', '#9575CD'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#66BB6A', '#9575CD']
            }
        ]
    };

    const radarData = {
        labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Running'],
        datasets: [
            {
                label: '2023',
                backgroundColor: 'rgba(179,181,198,0.2)',
                borderColor: 'rgba(179,181,198,1)',
                pointBackgroundColor: 'rgba(179,181,198,1)',
                data: [65, 59, 90, 81, 56, 55]
            },
            {
                label: '2024',
                backgroundColor: 'rgba(255,99,132,0.2)',
                borderColor: 'rgba(255,99,132,1)',
                pointBackgroundColor: 'rgba(255,99,132,1)',
                data: [28, 48, 40, 19, 96, 27]
            }
        ]
    };

    const polarData = {
        labels: ['Sales', 'Expenses', 'Revenue', 'Profit'],
        datasets: [
            {
                data: [11, 16, 7, 14],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#66BB6A'],
                label: 'Dataset 1'
            }
        ]
    };

    return (
        <div className="grid">
            <div className="col-6">
                <Card title="Bar Chart">
                    <Chart type="bar" data={barData} />
                </Card>
            </div>
            <div className="col-6">
                <Card title="Line Chart">
                    <Chart type="line" data={lineData} />
                </Card>
            </div>
            <div className="col-6">
                <Card title="Pie Chart">
                    <Chart type="pie" data={pieData} />
                </Card>
            </div>
            <div className="col-6">
                <Card title="Doughnut Chart">
                    <Chart type="doughnut" data={doughnutData} />
                </Card>
            </div>
            <div className="col-6">
                <Card title="Radar Chart">
                    <Chart type="radar" data={radarData} />
                </Card>
            </div>
            <div className="col-6">
                <Card title="Polar Area Chart">
                    <Chart type="polarArea" data={polarData} />
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
