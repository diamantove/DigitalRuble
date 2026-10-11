using Api;
using Api.Extensions;
using Application;
using Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddInfrastructureServices(builder.Configuration)
    .AddApiServices(builder.Environment, builder.Configuration)
    .AddApplicationServices();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

var app = builder.Build();

var applyMigrations = builder.Configuration.GetValue<bool>("Database:ApplyMigrations");

if (applyMigrations)
{
    await app.InitializeDatabaseAsync(builder.Configuration, builder.Environment);
}

app.UseApiServices();

app.Run();