using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinSight.Data.Migrations
{
    public partial class UpdateBankTransactionSchema : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Merchant",
                table: "BankTransactions",
                newName: "ReferenceNumber");

            migrationBuilder.RenameColumn(
                name: "Category",
                table: "BankTransactions",
                newName: "Description");

            migrationBuilder.AlterColumn<int>(
                name: "TransactionType",
                table: "BankTransactions",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<decimal>(
                name: "BalanceAfterTransaction",
                table: "BankTransactions",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BalanceAfterTransaction",
                table: "BankTransactions");

            migrationBuilder.RenameColumn(
                name: "ReferenceNumber",
                table: "BankTransactions",
                newName: "Merchant");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "BankTransactions",
                newName: "Category");

            migrationBuilder.AlterColumn<string>(
                name: "TransactionType",
                table: "BankTransactions",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");
        }
    }
}
