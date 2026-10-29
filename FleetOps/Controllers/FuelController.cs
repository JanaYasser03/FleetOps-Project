using Microsoft.AspNetCore.Mvc;

namespace FleetOps.Controllers;

public class FuelController : Controller
{
    public IActionResult Index() => View();
}
