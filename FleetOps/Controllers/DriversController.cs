using Microsoft.AspNetCore.Mvc;

namespace FleetOps.Controllers;

public class DriversController : Controller
{
    public IActionResult Index() => View();
}
