using Microsoft.AspNetCore.Mvc;

namespace FleetOps.Controllers;

public class CustomersController : Controller
{
    public IActionResult Index() => View();
}
