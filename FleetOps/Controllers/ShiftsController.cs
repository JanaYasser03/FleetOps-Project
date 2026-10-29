using Microsoft.AspNetCore.Mvc;

namespace FleetOps.Controllers;

public class ShiftsController : Controller
{
    public IActionResult Index() => View();
}
