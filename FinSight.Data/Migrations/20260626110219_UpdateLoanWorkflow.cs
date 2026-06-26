using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinSight.Data.Migrations
{
    public partial class UpdateLoanWorkflow : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "LoanApplications",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<DateTime>(
                name: "DecisionDate",
                table: "LoanApplications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DecisionReason",
                table: "LoanApplications",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DecisionDate",
                table: "LoanApplications");

            migrationBuilder.DropColumn(
                name: "DecisionReason",
                table: "LoanApplications");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "LoanApplications",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");
        }
    }
}
