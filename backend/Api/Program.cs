using Api;
using Api.Extensions;
using Application;
using Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApiServices(builder.Environment, builder.Configuration)
    .AddInfrastructureServices(builder.Configuration)
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